import mongoose from "mongoose";
import Order from "../models/order.model";
import Product from "../models/product.model";
import Fulfillment from "../models/fulfillment.model";
import WebhookEvent from "../models/webhookEvent.model";
import { createNotification } from "./notify.service";

/** The event has already been applied — a duplicate/replayed delivery. 200. */
export class DuplicateWebhookEventError extends Error {
    constructor(eventId: string) {
        super(`Webhook event ${eventId} already processed`);
        this.name = "DuplicateWebhookEventError";
    }
}

/**
 * No pending order matches the reference yet. Likely a race where the order row
 * hasn't committed — we throw so nothing is recorded and Paystack retries later.
 */
export class OrderNotReadyError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "OrderNotReadyError";
    }
}

/** The event is missing the identifiers we need to find the order. 400. */
export class PaymentDataError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "PaymentDataError";
    }
}

export interface FulfillmentOutcome {
    status: "fulfilled" | "already_processed";
    orderId: string;
    backordered?: { product: string; quantity: number }[];
}

// Shape of the Paystack charge.success `data` object (only the fields we use).
export interface PaystackChargeData {
    id: number;
    reference: string;
    metadata?: { orderId?: string } | null;
}

const isDuplicateKeyError = (err: unknown): boolean =>
    typeof err === "object" &&
    err !== null &&
    (err as { code?: number }).code === 11000;

/**
 * Applies a verified Paystack `charge.success` event to its order.
 *
 * One Mongoose transaction, all-or-nothing, safe against duplicate/concurrent
 * deliveries via two guards inside the txn:
 *
 *   1. Idempotency ledger — the reference is inserted into WebhookEvent, whose
 *      unique index rejects any second delivery of the same transaction.
 *   2. Atomic status transition — the order is claimed with a single
 *      findOneAndUpdate guarded on `status: "pending"`, so stock is decremented
 *      and the fulfilment created exactly once.
 *
 * Stock uses a conditional `$inc` (`stock >= quantity`); shortfalls are recorded
 * as backordered rather than driven negative, because payment already succeeded.
 *
 * NOTE: requires MongoDB as a replica set / mongos for transactions.
 */
export const processPaystackCharge = async (params: {
    data: PaystackChargeData;
}): Promise<FulfillmentOutcome> => {
    const { data } = params;
    const reference = data.reference;

    if (!reference) {
        throw new PaymentDataError("Charge has no reference");
    }

    // The idempotency key: one successful transaction per reference.
    const eventId = `paystack:${reference}`;

    // Identifiers we can match an order on: metadata.orderId (if we set it at
    // initialise time) or the stored paymentReference.
    const metadataOrderId = data.metadata?.orderId;
    const orClauses: Record<string, unknown>[] = [{ paymentReference: reference }];
    if (metadataOrderId && mongoose.isValidObjectId(metadataOrderId)) {
        orClauses.push({ _id: metadataOrderId });
    }

    const session = await mongoose.startSession();
    try {
        let outcome: FulfillmentOutcome | undefined;
        let notifyInfo:
            | { buyer: unknown; productIds: unknown[]; shortId: string }
            | undefined;

        await session.withTransaction(async () => {
            // 1. Idempotency ledger. Duplicate delivery => unique-index violation.
            try {
                await WebhookEvent.create(
                    [{ eventId, provider: "paystack", type: "charge.success" }],
                    { session }
                );
            } catch (err) {
                if (isDuplicateKeyError(err)) {
                    throw new DuplicateWebhookEventError(eventId);
                }
                throw err;
            }

            // 2. Atomically claim the pending order.
            const order = await Order.findOneAndUpdate(
                { $or: orClauses, status: "pending" },
                { $set: { status: "paid", paymentReference: reference } },
                { new: true, session }
            );

            if (!order) {
                const existing = await Order.findOne({ $or: orClauses }).session(
                    session
                );
                if (existing) {
                    outcome = {
                        status: "already_processed",
                        orderId: String(existing._id),
                    };
                    return;
                }
                throw new OrderNotReadyError(
                    "No pending order found for this reference"
                );
            }

            // 3. Decrement stock, guarded so it never goes negative.
            const backordered: { product: string; quantity: number }[] = [];
            for (const item of order.orderItems) {
                const res = await Product.updateOne(
                    { _id: item.product, stock: { $gte: item.quantity } },
                    { $inc: { stock: -item.quantity } },
                    { session }
                );
                if (res.matchedCount === 0) {
                    backordered.push({
                        product: String(item.product),
                        quantity: item.quantity,
                    });
                }
            }

            // 4. Create the fulfilment (unique on `order` as a final guard).
            try {
                await Fulfillment.create(
                    [
                        {
                            order: order._id,
                            items: order.orderItems.map((i) => ({
                                product: i.product,
                                quantity: i.quantity,
                                price: i.price,
                            })),
                            backorderedItems: backordered.map((b) => ({
                                product: b.product,
                                quantity: b.quantity,
                            })),
                            status: "pending",
                        },
                    ],
                    { session }
                );
            } catch (err) {
                if (!isDuplicateKeyError(err)) throw err;
            }

            outcome = {
                status: "fulfilled",
                orderId: String(order._id),
                backordered,
            };
            notifyInfo = {
                buyer: order.buyer,
                productIds: order.orderItems.map((i) => i.product),
                shortId: String(order._id).slice(-6),
            };
        });

        // Best-effort notifications, after the transaction commits.
        if (notifyInfo) {
            const { buyer, productIds, shortId } = notifyInfo;
            await createNotification(
                buyer,
                `Your order #${shortId} is confirmed and is being processed.`,
                "order"
            );
            const vendors = await Product.find({
                _id: { $in: productIds },
            }).distinct("vendor");
            await Promise.all(
                vendors.map((v) =>
                    createNotification(v, `You have a new paid order #${shortId}.`, "order")
                )
            );
        }

        return outcome as FulfillmentOutcome;
    } finally {
        await session.endSession();
    }
};
