import mongoose from "mongoose";
import Order, { IOrder, IShippingAddress } from "../models/order.model";
import User from "../models/user.model";
import Product from "../models/product.model";
import { scoreOrder } from "./fraud.service";
import { computeTotals } from "./pricing.service";
import { decrementStock } from "./stock.service";

export interface CreateOrderInput {
    buyer: string;
    orderItems: {
        product: string;
        quantity: number;
        price: number;
    }[];
    totalPrice: number;
}

export class OrderError extends Error {
    status: number;
    constructor(message: string, status = 400) {
        super(message);
        this.name = "OrderError";
        this.status = status;
    }
}

/**
 * Creates an order, runs the credit-limit + fraud checks, and debits the buyer's
 * available balance — all inside a single Mongoose transaction so the three
 * writes commit together or not at all.
 *
 * The fraud call (network I/O) happens *before* the transaction commits but the
 * user debit and order insert share one session, so we never end up with a
 * debited balance and no order (or vice versa). If the fraud service throws or
 * flags the order, the transaction is aborted and nothing is persisted.
 *
 * NOTE: multi-document transactions require MongoDB to run as a replica set (or
 * mongos). A standalone `mongod` will throw "Transaction numbers are only
 * allowed on a replica set member or mongos". Atlas and `docker run mongo` with
 * `--replSet` both satisfy this.
 */
export const createOrder = async (input: CreateOrderInput): Promise<IOrder> => {
    const session = await mongoose.startSession();
    try {
        let createdOrder: IOrder | undefined;

        await session.withTransaction(async () => {
            const buyer = await User.findById(input.buyer).session(session);
            if (!buyer) {
                throw new OrderError("Order buyer not found", 404);
            }

            // 1. Credit-limit check: the order must fit within available balance
            // plus the buyer's approved credit line.
            const spendingPower = buyer.availableBalance + buyer.creditLimit;
            if (input.totalPrice > spendingPower) {
                throw new OrderError("Order exceeds available credit limit", 402);
            }

            // 2. External fraud scoring. Done inside the transaction callback but
            // before any writes so an abort cleanly rolls everything back.
            const fraud = await scoreOrder({
                userId: String(buyer._id),
                amount: input.totalPrice,
                items: input.orderItems,
            });
            if (fraud.flagged) {
                throw new OrderError("Order flagged as potentially fraudulent", 403);
            }

            // 3. Debit the buyer and insert the order under the same session.
            buyer.availableBalance = buyer.availableBalance - input.totalPrice;
            await buyer.save({ session });

            const orders = await Order.create(
                [
                    {
                        buyer: input.buyer,
                        orderItems: input.orderItems,
                        totalPrice: input.totalPrice,
                        status: "pending",
                    },
                ],
                { session }
            );
            createdOrder = orders[0];
        });

        // withTransaction guarantees createdOrder is set if it committed.
        return createdOrder as IOrder;
    } finally {
        await session.endSession();
    }
};

export interface CheckoutItemInput {
    product: string;
    quantity: number;
    color?: string;
    size?: string;
}

export interface CheckoutInput {
    buyer: string;
    items: CheckoutItemInput[];
    shippingAddress: IShippingAddress;
    // Optional client-generated key (e.g. a UUID per checkout attempt) that makes
    // this call idempotent — a double-click returns the same order.
    idempotencyKey?: string;
}

const REQUIRED_ADDRESS_FIELDS: (keyof IShippingAddress)[] = [
    "fullName",
    "phone",
    "addressLine1",
    "city",
    "state",
];

const isDuplicateKeyError = (err: unknown): boolean =>
    typeof err === "object" &&
    err !== null &&
    (err as { code?: number }).code === 11000;

/**
 * Creates a `pending` order for a pay-now (Paystack) checkout.
 *
 * Unlike createOrder this does NOT touch the buyer's balance or run the credit /
 * fraud checks — those belong to the store-credit flow. Stock is RESERVED here
 * (decremented inside a transaction, variant-aware) and held until reservedUntil;
 * if payment doesn't complete a sweep releases it (orderMaintenance.service).
 * Fulfilment therefore does not decrement again. Prices AND product names are
 * read from the DB (never trusted from the client) and snapshotted onto the order.
 *
 * Idempotent when an idempotencyKey is supplied: a repeated request (double-click
 * or client retry) returns the existing order instead of creating a duplicate.
 */
export const createPendingOrder = async (
    input: CheckoutInput
): Promise<IOrder> => {
    if (!input.items || input.items.length === 0) {
        throw new OrderError("Cart is empty");
    }

    // Validate the shipping address up front — can't fulfil without it.
    const address = input.shippingAddress;
    if (!address) {
        throw new OrderError("Shipping address is required");
    }
    for (const field of REQUIRED_ADDRESS_FIELDS) {
        if (!address[field] || String(address[field]).trim() === "") {
            throw new OrderError(`Shipping address ${field} is required`);
        }
    }

    for (const it of input.items) {
        if (!mongoose.isValidObjectId(it.product)) {
            throw new OrderError(`Invalid product id: ${it.product}`);
        }
        const qty = Number(it.quantity);
        if (!Number.isInteger(qty) || qty < 1) {
            throw new OrderError(`Invalid quantity for product ${it.product}`);
        }
    }

    // Fast path: if this key already produced an order, return it.
    if (input.idempotencyKey) {
        const existing = await Order.findOne({
            buyer: input.buyer,
            idempotencyKey: input.idempotencyKey,
        });
        if (existing) return existing;
    }

    const ids = input.items.map((i) => i.product);
    const reservationMs =
        (Number(process.env.RESERVATION_MINUTES) || 30) * 60 * 1000;

    const session = await mongoose.startSession();
    try {
        let result: IOrder | undefined;

        await session.withTransaction(async () => {
            // Idempotency inside the transaction (also guarded by a unique index).
            if (input.idempotencyKey) {
                const existing = await Order.findOne({
                    buyer: input.buyer,
                    idempotencyKey: input.idempotencyKey,
                }).session(session);
                if (existing) {
                    result = existing;
                    return;
                }
            }

            const products = await Product.find({
                _id: { $in: ids },
                status: "approved",
            }).session(session);
            const byId = new Map(products.map((p) => [String(p._id), p]));

            const orderItems: IOrder["orderItems"] = [];
            let subtotal = 0;

            for (const it of input.items) {
                const product = byId.get(it.product) as any;
                if (!product) {
                    throw new OrderError(
                        `Product ${it.product} is unavailable`,
                        400
                    );
                }

                const hasVariants =
                    Array.isArray(product.variants) &&
                    product.variants.length > 0;
                if (hasVariants && !it.size) {
                    throw new OrderError(
                        `Select a size for "${product.name}"`,
                        400
                    );
                }
                if (
                    hasVariants &&
                    !product.variants.some((v: any) => v.size === it.size)
                ) {
                    throw new OrderError(
                        `Size "${it.size}" is unavailable for "${product.name}"`,
                        400
                    );
                }

                // Reserve stock atomically. A guarded decrement is what makes
                // concurrent checkouts for the last unit safe — only one wins.
                const reserved = await decrementStock(
                    session,
                    product,
                    it.size,
                    it.quantity
                );
                if (!reserved) {
                    throw new OrderError(
                        `Insufficient stock for "${product.name}"${
                            it.size ? ` (${it.size})` : ""
                        }`,
                        409
                    );
                }

                orderItems.push({
                    product: product._id,
                    name: product.name,
                    quantity: it.quantity,
                    price: product.price,
                    color: it.color,
                    size: it.size,
                });
                subtotal += product.price * it.quantity;
            }

            // Server-authoritative totals: VAT + shipping on the DB-priced subtotal.
            const totals = computeTotals(subtotal);

            const created = await Order.create(
                [
                    {
                        buyer: input.buyer,
                        orderItems,
                        shippingAddress: address,
                        subtotal: totals.subtotal,
                        tax: totals.tax,
                        shippingFee: totals.shippingFee,
                        totalPrice: totals.total,
                        status: "pending",
                        idempotencyKey: input.idempotencyKey,
                        stockReserved: true,
                        reservedUntil: new Date(Date.now() + reservationMs),
                    },
                ],
                { session }
            );
            result = created[0];
        });

        return result as IOrder;
    } catch (err) {
        // Concurrent duplicate key raced past the checks — return the winner.
        if (isDuplicateKeyError(err) && input.idempotencyKey) {
            const existing = await Order.findOne({
                buyer: input.buyer,
                idempotencyKey: input.idempotencyKey,
            });
            if (existing) return existing;
        }
        throw err;
    } finally {
        await session.endSession();
    }
};
