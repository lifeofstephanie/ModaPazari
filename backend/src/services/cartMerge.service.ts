import mongoose from "mongoose";
import Cart, { ICart } from "../models/cart.model";
import Product from "../models/product.model";

export interface GuestCartItem {
    product: string;
    quantity: number;
    price: number;
}

export interface MergeCartInput {
    user: string;
    guestItems: GuestCartItem[];
}

export interface MergedCartItem {
    product: string;
    quantity: number;
    price: number;
}

/**
 * A single, user-facing note about something we changed while merging.
 *   - "dropped"      : the item is gone (deleted product or out of stock).
 *   - "capped"       : requested quantity exceeded stock, trimmed to what's left.
 *   - "price_change" : the guest-cart price was stale; current price differs.
 */
export interface CartWarning {
    product: string;
    name?: string;
    reason: "dropped" | "capped" | "price_change";
    message: string;
}

export interface MergeCartResult {
    items: MergedCartItem[];
    warnings: CartWarning[];
}

export class CartMergeError extends Error {
    status: number;
    constructor(message: string, status = 400) {
        super(message);
        this.name = "CartMergeError";
        this.status = status;
    }
}

/**
 * Merges a guest cart into the buyer's persisted MongoDB cart when they log in.
 *
 * Everything happens inside one Mongoose transaction so we never partial-save:
 * the product re-read and the cart write share a session and commit together or
 * not at all.
 *
 * Behaviour:
 *   1. Quantities for items present in both carts are summed, then capped at the
 *      product's current stock.
 *   2. Prices are always re-read from the Product collection — the guest-cart
 *      price is treated as untrusted and only used to detect that it went stale.
 *   3. Items whose product was deleted or is out of stock are dropped, and every
 *      drop / cap / price change is reported back in `warnings` for the UI.
 *
 * NOTE: multi-document transactions require MongoDB to run as a replica set (or
 * mongos) — same constraint as createOrder in order.service.ts.
 */
export const mergeGuestCart = async (
    input: MergeCartInput
): Promise<MergeCartResult> => {
    const session = await mongoose.startSession();
    try {
        let result: MergeCartResult | undefined;

        await session.withTransaction(async () => {
            // 1. Load (or lazily create) the buyer's persisted cart.
            let cart = await Cart.findOne({ user: input.user }).session(session);
            if (!cart) {
                const created = await Cart.create(
                    [{ user: input.user, items: [] }],
                    { session }
                );
                cart = created[0];
            }

            // 2. Sum quantities per product across the DB cart and the guest cart.
            //    Guest prices are stashed only so we can flag stale pricing later.
            const quantities = new Map<string, number>();
            const guestPrices = new Map<string, number>();

            for (const item of cart.items) {
                const id = String(item.product);
                quantities.set(id, (quantities.get(id) ?? 0) + item.quantity);
            }
            for (const item of input.guestItems) {
                if (!mongoose.isValidObjectId(item.product)) {
                    throw new CartMergeError(
                        `Invalid product id in guest cart: ${item.product}`
                    );
                }
                const qty = Number(item.quantity);
                if (!Number.isFinite(qty) || qty <= 0) {
                    throw new CartMergeError(
                        `Invalid quantity for product ${item.product}`
                    );
                }
                const id = String(item.product);
                quantities.set(id, (quantities.get(id) ?? 0) + qty);
                guestPrices.set(id, item.price);
            }

            // 3. Re-read every referenced product in one query, under the session,
            //    so pricing/stock reflect the same committed snapshot as our write.
            const ids = [...quantities.keys()];
            const products = await Product.find({ _id: { $in: ids } }).session(
                session
            );
            const productById = new Map(
                products.map((p) => [String(p._id), p])
            );

            // 4. Resolve each merged line into a clean item + any warnings.
            const items: MergedCartItem[] = [];
            const warnings: CartWarning[] = [];

            for (const id of ids) {
                const product = productById.get(id);

                // Deleted product -> drop.
                if (!product) {
                    warnings.push({
                        product: id,
                        reason: "dropped",
                        message: "Item was removed because it is no longer available.",
                    });
                    continue;
                }

                // Out of stock -> drop.
                if (product.stock <= 0) {
                    warnings.push({
                        product: id,
                        name: product.name,
                        reason: "dropped",
                        message: `"${product.name}" is out of stock and was removed.`,
                    });
                    continue;
                }

                const requested = quantities.get(id) ?? 0;
                const quantity = Math.min(requested, product.stock);
                if (quantity < requested) {
                    warnings.push({
                        product: id,
                        name: product.name,
                        reason: "capped",
                        message: `Only ${product.stock} of "${product.name}" left; quantity reduced from ${requested} to ${product.stock}.`,
                    });
                }

                // Guest price was informational only; flag it if it drifted.
                const guestPrice = guestPrices.get(id);
                if (guestPrice !== undefined && guestPrice !== product.price) {
                    warnings.push({
                        product: id,
                        name: product.name,
                        reason: "price_change",
                        message: `Price for "${product.name}" changed from ${guestPrice} to ${product.price}.`,
                    });
                }

                items.push({ product: id, quantity, price: product.price });
            }

            // 5. Persist the cleaned cart. The Cart schema stores only
            //    product + quantity, so price lives in the returned summary.
            cart.items = items.map((i) => ({
                product: i.product as unknown as ICart["items"][number]["product"],
                quantity: i.quantity,
            }));
            await cart.save({ session });

            result = { items, warnings };
        });

        // withTransaction guarantees result is set if the transaction committed.
        return result as MergeCartResult;
    } finally {
        await session.endSession();
    }
};
