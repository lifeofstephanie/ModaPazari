import mongoose from "mongoose";
import Order, { IOrder } from "../models/order.model";
import Product from "../models/product.model";
import PromoCode from "../models/promoCode.model";
import { OrderError } from "./order.service";

export interface PromoCheckoutInput {
    buyer: string;
    promoCode: string;
    orderItems: {
        product: string;
        quantity: number;
        price: number;
    }[];
}

/**
 * Redeems a promo code and checks out an order in one atomic step.
 *
 * Concurrency is the whole point here: if two shoppers race for the last
 * remaining coupon redemption — or the last unit of stock — at the same
 * millisecond, exactly one must win. We get that guarantee from MongoDB's
 * per-document atomic conditional updates rather than a read-then-write, which
 * would be open to a lost-update race:
 *
 *   - Promo:  findOneAndUpdate({ usedCount < maxUses }, { $inc: usedCount }).
 *             The filter and the increment evaluate atomically against the
 *             single document, so the redemption that pushes usedCount to
 *             maxUses is the last one the filter ever matches.
 *   - Stock:  findOneAndUpdate({ stock >= quantity }, { $inc: -quantity }).
 *             Same idea per product — a decrement can never drive stock below 0.
 *
 * All of these run inside one transaction, so a later failure (e.g. item 3 is
 * out of stock) rolls back the promo increment and the earlier stock debits —
 * we never leave a coupon "spent" on an order that was never created.
 *
 * NOTE: multi-document transactions require MongoDB to run as a replica set (or
 * mongos); a standalone mongod will reject them. See order.service.ts.
 */
export const applyPromoCodeAndCheckout = async (
    input: PromoCheckoutInput
): Promise<IOrder> => {
    if (!input.orderItems || input.orderItems.length === 0) {
        throw new OrderError("Order must contain at least one item", 400);
    }

    const session = await mongoose.startSession();
    try {
        let createdOrder: IOrder | undefined;

        await session.withTransaction(async () => {
            // 1. Atomically claim one redemption of the promo code. The filter
            // rejects the write once usedCount has reached maxUses, so only one
            // request can ever take the final slot.
            const promo = await PromoCode.findOneAndUpdate(
                {
                    code: input.promoCode.toUpperCase().trim(),
                    active: true,
                    $expr: { $lt: ["$usedCount", "$maxUses"] },
                    $or: [
                        { expiresAt: { $exists: false } },
                        { expiresAt: { $gt: new Date() } },
                    ],
                },
                { $inc: { usedCount: 1 } },
                { new: true, session }
            );

            if (!promo) {
                // Distinguish "doesn't exist" from "exhausted/expired" for a
                // clearer client message, without a second race window — this
                // read is only for the error path.
                const exists = await PromoCode.exists({
                    code: input.promoCode.toUpperCase().trim(),
                }).session(session);
                throw new OrderError(
                    exists
                        ? "Promo code is no longer available"
                        : "Promo code not found",
                    exists ? 409 : 404
                );
            }

            // 2. Atomically claim stock for each item. A guarded $inc can never
            // drive stock below zero, so two buyers cannot both take the last
            // unit.
            let subtotal = 0;
            for (const item of input.orderItems) {
                if (item.quantity <= 0) {
                    throw new OrderError("Item quantity must be positive", 400);
                }

                const updated = await Product.findOneAndUpdate(
                    { _id: item.product, stock: { $gte: item.quantity } },
                    { $inc: { stock: -item.quantity } },
                    { new: true, session }
                );

                if (!updated) {
                    // Either the product is gone or stock is insufficient.
                    // Aborting the transaction restores the promo increment and
                    // any earlier stock debits.
                    throw new OrderError(
                        `Insufficient stock for product ${item.product}`,
                        409
                    );
                }

                subtotal += item.price * item.quantity;
            }

            // 3. Apply the discount and create the order in the same session.
            const totalPrice = applyDiscount(
                subtotal,
                promo.discountType,
                promo.discountValue
            );

            const orders = await Order.create(
                [
                    {
                        buyer: input.buyer,
                        orderItems: input.orderItems,
                        totalPrice,
                        status: "pending",
                    },
                ],
                { session }
            );
            createdOrder = orders[0];
        });

        return createdOrder as IOrder;
    } finally {
        await session.endSession();
    }
};

const applyDiscount = (
    subtotal: number,
    type: "percentage" | "fixed",
    value: number
): number => {
    const discounted =
        type === "percentage"
            ? subtotal * (1 - value / 100)
            : subtotal - value;
    // Never let a discount produce a negative total.
    return Math.max(0, discounted);
};
