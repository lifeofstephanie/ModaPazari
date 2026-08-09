import mongoose from "mongoose";
import Cart, { ICart } from "../models/cart.model";
import Product from "../models/product.model";

export interface GuestCartItem {
    product: string;
    quantity: number;
    price?: number;
    color?: string;
    size?: string;
}

export interface MergeCartInput {
    user: string;
    guestItems: GuestCartItem[];
}

export interface CartWarning {
    product: string;
    name?: string;
    reason: "dropped" | "capped" | "price_change";
    message: string;
}

export interface MergedCartItem {
    product: string;
    quantity: number;
    price: number;
    color: string;
    size: string;
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

// A cart line is identified by product + colour + size.
const variantKey = (productId: string, color = "", size = "") =>
    `${productId}|${color}|${size}`;

/**
 * Merges a guest cart into the buyer's persisted MongoDB cart on login.
 *
 * Runs in one transaction. Quantities for the same product+colour+size are
 * summed then capped at stock; prices are re-read from the DB (guest price is
 * only used to flag staleness); deleted / out-of-stock products are dropped.
 */
export const mergeGuestCart = async (
    input: MergeCartInput
): Promise<MergeCartResult> => {
    const session = await mongoose.startSession();
    try {
        let result: MergeCartResult | undefined;

        await session.withTransaction(async () => {
            let cart = await Cart.findOne({ user: input.user }).session(session);
            if (!cart) {
                const created = await Cart.create(
                    [{ user: input.user, items: [] }],
                    { session }
                );
                cart = created[0];
            }

            // Sum quantities per variant across the DB cart and the guest cart.
            const lines = new Map<
                string,
                { product: string; color: string; size: string; quantity: number; guestPrice?: number }
            >();

            for (const item of cart.items) {
                const key = variantKey(String(item.product), item.color ?? "", item.size ?? "");
                const existing = lines.get(key);
                if (existing) existing.quantity += item.quantity;
                else
                    lines.set(key, {
                        product: String(item.product),
                        color: item.color ?? "",
                        size: item.size ?? "",
                        quantity: item.quantity,
                    });
            }

            for (const item of input.guestItems) {
                if (!mongoose.isValidObjectId(item.product)) {
                    throw new CartMergeError(`Invalid product id: ${item.product}`);
                }
                const qty = Number(item.quantity);
                if (!Number.isFinite(qty) || qty <= 0) {
                    throw new CartMergeError(`Invalid quantity for product ${item.product}`);
                }
                const color = item.color ?? "";
                const size = item.size ?? "";
                const key = variantKey(item.product, color, size);
                const existing = lines.get(key);
                if (existing) {
                    existing.quantity += qty;
                    existing.guestPrice = item.price;
                } else {
                    lines.set(key, {
                        product: item.product,
                        color,
                        size,
                        quantity: qty,
                        guestPrice: item.price,
                    });
                }
            }

            // Re-read every referenced product once, under the session.
            const ids = [...new Set([...lines.values()].map((l) => l.product))];
            const products = await Product.find({ _id: { $in: ids } }).session(session);
            const productById = new Map(products.map((p) => [String(p._id), p]));

            const items: MergedCartItem[] = [];
            const warnings: CartWarning[] = [];

            for (const line of lines.values()) {
                const product = productById.get(line.product) as any;

                if (!product) {
                    warnings.push({
                        product: line.product,
                        reason: "dropped",
                        message: "An item was removed because it is no longer available.",
                    });
                    continue;
                }
                if (product.stock <= 0) {
                    warnings.push({
                        product: line.product,
                        name: product.name,
                        reason: "dropped",
                        message: `"${product.name}" is out of stock and was removed.`,
                    });
                    continue;
                }

                const quantity = Math.min(line.quantity, product.stock);
                if (quantity < line.quantity) {
                    warnings.push({
                        product: line.product,
                        name: product.name,
                        reason: "capped",
                        message: `Only ${product.stock} of "${product.name}" left; quantity reduced.`,
                    });
                }
                if (line.guestPrice !== undefined && line.guestPrice !== product.price) {
                    warnings.push({
                        product: line.product,
                        name: product.name,
                        reason: "price_change",
                        message: `Price for "${product.name}" changed to ${product.price}.`,
                    });
                }

                items.push({
                    product: line.product,
                    quantity,
                    price: product.price,
                    color: line.color,
                    size: line.size,
                });
            }

            cart.items = items.map((i) => ({
                product: i.product,
                quantity: i.quantity,
                color: i.color,
                size: i.size,
            })) as unknown as ICart["items"];
            await cart.save({ session });

            result = { items, warnings };
        });

        return result as MergeCartResult;
    } finally {
        await session.endSession();
    }
};
