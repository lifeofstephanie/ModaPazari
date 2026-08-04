import mongoose from "mongoose";
import Order from "../models/order.model";

/**
 * Monthly vendor payout aggregation.
 *
 * Read-only and parameterised. Computes, per vendor, the net amount owed for a
 * single calendar month:
 *
 *     netPayout(base) = Σ_currency convert( Σ item.price * netQty , currency → base )
 *
 * Two things are deliberately NOT done inside the pipeline:
 *
 *   • Currency conversion. Rates come from a custom application service, not a
 *     collection, so the pipeline keeps money in its native currency and groups
 *     per (vendor, currency). Conversion happens once, in a batched call, after
 *     the page is sliced — see getMonthlyVendorPayouts.
 *
 *   • Final payout sorting. Native amounts across mixed currencies aren't
 *     comparable, so the pipeline paginates on a STABLE key (vendorId). Only the
 *     current page is converted, then sorted by the base-currency payout. This
 *     keeps pagination cheap (we never convert every vendor just to sort).
 *
 * ── Schema assumptions (adjust field names to match your collections) ────────
 *   orders        : { cart, currency?, status, createdAt,
 *                     orderItems: [{ product, quantity, price }] }
 *                     (price is in the order's own `currency`)
 *   products       : { _id, vendor }
 *   users          : { _id, storeName, firstName, lastName }
 *   refunds        : { cart, product, quantity, status }   ← links by CART id
 *
 * Refunds are pulled from their own collection with a correlated $lookup on
 * cart + product (only `approved` refunds count).
 */

export interface MonthlyPayoutParams {
    year: number;
    month: number; // 1–12
    page?: number; // 1-based
    pageSize?: number;
    baseCurrency?: string;
    /** Order statuses eligible for payout. */
    payableStatuses?: string[];
    /** Platform cut, 0–1 (e.g. 0.1 = keep 10%). */
    commissionRate?: number;
}

/**
 * Batched currency converter supplied by the caller. Given a list of
 * (amount, from) pairs and a target currency, returns the converted amounts in
 * the same order. Implement this with your custom FX service.
 */
export type ConvertMany = (
    items: { amount: number; from: string }[],
    to: string
) => Promise<number[]>;

export const buildMonthlyPayoutPipeline = (
    params: MonthlyPayoutParams
): mongoose.PipelineStage[] => {
    const {
        year,
        month,
        page = 1,
        pageSize = 20,
        baseCurrency = "USD",
        payableStatuses = ["paid", "shipped", "delivered"],
    } = params;

    // Half-open [monthStart, nextMonthStart) range in UTC → index-friendly and
    // free of end-of-month edge cases.
    const monthStart = new Date(Date.UTC(year, month - 1, 1));
    const nextMonth = new Date(Date.UTC(year, month, 1));
    const skip = Math.max(0, (page - 1) * pageSize);

    // Order's currency, defaulting to base when unset.
    const currencyExpr = { $ifNull: ["$currency", baseCurrency] };

    return [
        // 1. Narrow to the month + payable orders before any unwind/join.
        {
            $match: {
                createdAt: { $gte: monthStart, $lt: nextMonth },
                status: { $in: payableStatuses },
            },
        },

        // 2. One document per line item.
        { $unwind: "$orderItems" },

        // 3. Resolve the vendor that owns each item.
        {
            $lookup: {
                from: "products",
                let: { pid: "$orderItems.product" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$_id", "$$pid"] } } },
                    { $project: { vendor: 1 } },
                ],
                as: "product",
            },
        },
        { $unwind: "$product" },

        // 4. Pull approved refunds for this order's CART + product from the
        //    separate refunds collection and sum the refunded quantity.
        {
            $lookup: {
                from: "refunds",
                let: { cartId: "$cart", productId: "$orderItems.product" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$cart", "$$cartId"] },
                                    { $eq: ["$product", "$$productId"] },
                                    { $eq: ["$status", "approved"] },
                                ],
                            },
                        },
                    },
                    { $group: { _id: null, qty: { $sum: "$quantity" } } },
                ],
                as: "refundInfo",
            },
        },

        // 5. Net quantity after refunds. No currency conversion here.
        {
            $addFields: {
                _refundedQty: {
                    $ifNull: [{ $arrayElemAt: ["$refundInfo.qty", 0] }, 0],
                },
            },
        },
        {
            $addFields: {
                _netQty: {
                    $max: [
                        { $subtract: ["$orderItems.quantity", "$_refundedQty"] },
                        0,
                    ],
                },
            },
        },

        // 6. Group per (vendor, currency) — native amounts only. This is the
        //    stage pagination must not break, so it runs before any skip/limit.
        {
            $group: {
                _id: { vendor: "$product.vendor", currency: currencyExpr },
                grossSales: {
                    $sum: {
                        $multiply: ["$orderItems.quantity", "$orderItems.price"],
                    },
                },
                refundedAmount: {
                    $sum: { $multiply: ["$_refundedQty", "$orderItems.price"] },
                },
                netPayout: {
                    $sum: { $multiply: ["$_netQty", "$orderItems.price"] },
                },
                itemsSold: { $sum: "$_netQty" },
                // An order sits in exactly one currency bucket, so these ids
                // never overlap across buckets — a plain count per bucket is
                // safe to sum later.
                orderIds: { $addToSet: "$_id" },
            },
        },
        { $addFields: { bucketOrderCount: { $size: "$orderIds" } } },

        // 7. Collapse currency buckets back into one row per vendor, carrying a
        //    per-currency breakdown for the converter.
        {
            $group: {
                _id: "$_id.vendor",
                byCurrency: {
                    $push: {
                        currency: "$_id.currency",
                        grossSales: "$grossSales",
                        refundedAmount: "$refundedAmount",
                        netPayout: "$netPayout",
                    },
                },
                itemsSold: { $sum: "$itemsSold" },
                orderCount: { $sum: "$bucketOrderCount" },
            },
        },

        // 8. Paginate per vendor with $facet (count + page slice). Stable sort
        //    by vendorId — native netPayout isn't comparable across currencies;
        //    the page is re-sorted by base-currency payout after conversion.
        //    Vendor-detail $lookup lives in the data branch so only the page's
        //    vendors are joined.
        {
            $facet: {
                metadata: [{ $count: "totalVendors" }],
                data: [
                    { $sort: { _id: 1 } },
                    { $skip: skip },
                    { $limit: pageSize },
                    {
                        $lookup: {
                            from: "users",
                            let: { vid: "$_id" },
                            pipeline: [
                                { $match: { $expr: { $eq: ["$_id", "$$vid"] } } },
                                {
                                    $project: {
                                        storeName: 1,
                                        firstName: 1,
                                        lastName: 1,
                                    },
                                },
                            ],
                            as: "vendor",
                        },
                    },
                    { $unwind: { path: "$vendor", preserveNullAndEmptyArrays: true } },
                    {
                        $project: {
                            _id: 0,
                            vendorId: "$_id",
                            storeName: "$vendor.storeName",
                            vendorName: {
                                $trim: {
                                    input: {
                                        $concat: [
                                            { $ifNull: ["$vendor.firstName", ""] },
                                            " ",
                                            { $ifNull: ["$vendor.lastName", ""] },
                                        ],
                                    },
                                },
                            },
                            orderCount: 1,
                            itemsSold: 1,
                            byCurrency: 1,
                        },
                    },
                ],
            },
        },

        // 9. Flatten $facet; conversion + payout totals are added in JS.
        {
            $project: {
                data: 1,
                total: {
                    $ifNull: [{ $arrayElemAt: ["$metadata.totalVendors", 0] }, 0],
                },
            },
        },
    ];
};

interface CurrencyBucket {
    currency: string;
    grossSales: number;
    refundedAmount: number;
    netPayout: number;
}

interface RawPayoutRow {
    vendorId: mongoose.Types.ObjectId;
    storeName?: string;
    vendorName?: string;
    orderCount: number;
    itemsSold: number;
    byCurrency: CurrencyBucket[];
}

export interface PayoutRow {
    vendorId: mongoose.Types.ObjectId;
    storeName?: string;
    vendorName?: string;
    currency: string; // base currency
    orderCount: number;
    itemsSold: number;
    grossSales: number;
    refundedAmount: number;
    netPayout: number;
    commission: number;
    payableToVendor: number;
    byCurrency: CurrencyBucket[]; // native breakdown, for transparency
}

export interface PayoutPage {
    data: PayoutRow[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * Runs the payout pipeline for one page, then converts the page's native-
 * currency buckets to the base currency in a SINGLE batched call to the custom
 * FX service before summing each vendor's payout.
 */
export const getMonthlyVendorPayouts = async (
    params: MonthlyPayoutParams,
    convertMany: ConvertMany
): Promise<PayoutPage> => {
    const {
        page = 1,
        pageSize = 20,
        baseCurrency = "USD",
        commissionRate = 0,
    } = params;

    const pipeline = buildMonthlyPayoutPipeline(params);
    // allowDiskUse: the two $group stages + $facet can exceed the 100MB memory
    // limit on large months.
    const [result] = await Order.aggregate<{ data: RawPayoutRow[]; total: number }>(
        pipeline
    ).allowDiskUse(true);

    const rows = result?.data ?? [];
    const total = result?.total ?? 0;

    // Flatten every (amount, currency) that needs converting into one list, then
    // convert in a single batched call. gross / refunded / net per bucket → 3
    // amounts each; conversions are positionally mapped back afterwards.
    const toConvert: { amount: number; from: string }[] = [];
    for (const row of rows) {
        for (const b of row.byCurrency) {
            toConvert.push({ amount: b.grossSales, from: b.currency });
            toConvert.push({ amount: b.refundedAmount, from: b.currency });
            toConvert.push({ amount: b.netPayout, from: b.currency });
        }
    }

    const converted = toConvert.length
        ? await convertMany(toConvert, baseCurrency)
        : [];

    if (converted.length !== toConvert.length) {
        throw new Error(
            `Currency conversion returned ${converted.length} values, expected ${toConvert.length}`
        );
    }

    // Walk the converted values back in the same order and total per vendor.
    let cursor = 0;
    const data: PayoutRow[] = rows.map((row) => {
        let grossSales = 0;
        let refundedAmount = 0;
        let netPayout = 0;
        for (const _ of row.byCurrency) {
            grossSales += converted[cursor++];
            refundedAmount += converted[cursor++];
            netPayout += converted[cursor++];
        }
        const commission = netPayout * commissionRate;
        return {
            vendorId: row.vendorId,
            storeName: row.storeName,
            vendorName: row.vendorName,
            currency: baseCurrency,
            orderCount: row.orderCount,
            itemsSold: row.itemsSold,
            grossSales: round2(grossSales),
            refundedAmount: round2(refundedAmount),
            netPayout: round2(netPayout),
            commission: round2(commission),
            payableToVendor: round2(netPayout - commission),
            byCurrency: row.byCurrency,
        };
    });

    // Now that everything is in one currency, order the page by payout desc.
    data.sort((a, b) => b.netPayout - a.netPayout);

    return {
        data,
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
    };
};
