import { ClientSession } from "mongoose";
import Product from "../models/product.model";

/**
 * Variant-aware stock movement, shared by reservation (checkout), release
 * (expiry/cancel) and refund. Sized products move the specific size variant AND
 * the aggregate mirror; non-sized products move the flat stock.
 */

type ProductLike = {
  _id: unknown;
  variants?: { size: string; stock: number }[];
};

const isSized = (product: ProductLike, size?: string) =>
  Array.isArray(product.variants) && product.variants.length > 0 && !!size;

/** Guarded decrement — returns false if there wasn't enough stock. */
export const decrementStock = async (
  session: ClientSession,
  product: ProductLike,
  size: string | undefined,
  quantity: number
): Promise<boolean> => {
  if (isSized(product, size)) {
    const res = await Product.updateOne(
      {
        _id: product._id,
        variants: { $elemMatch: { size, stock: { $gte: quantity } } },
      },
      { $inc: { "variants.$[v].stock": -quantity, stock: -quantity } },
      { session, arrayFilters: [{ "v.size": size }] }
    );
    return res.matchedCount === 1;
  }
  const res = await Product.updateOne(
    { _id: product._id, stock: { $gte: quantity } },
    { $inc: { stock: -quantity } },
    { session }
  );
  return res.matchedCount === 1;
};

/** Return stock to inventory (order released or refunded). */
export const restoreStock = async (
  session: ClientSession,
  productId: unknown,
  size: string | undefined,
  quantity: number
): Promise<void> => {
  const product = await Product.findById(productId).session(session);
  if (!product) return;
  if (isSized(product as unknown as ProductLike, size)) {
    await Product.updateOne(
      { _id: productId },
      { $inc: { "variants.$[v].stock": quantity, stock: quantity } },
      { session, arrayFilters: [{ "v.size": size }] }
    );
  } else {
    await Product.updateOne(
      { _id: productId },
      { $inc: { stock: quantity } },
      { session }
    );
  }
};
