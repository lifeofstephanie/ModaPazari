import { Response } from "express";
import mongoose from "mongoose";
import Cart from "../models/cart.model";
import { AuthRequest } from "../middleware/auth";
import { mergeGuestCart, CartMergeError } from "../services/cartMerge.service";

// Always hand the client the populated cart so it has display fields.
const populatedCart = (userId: string) =>
    Cart.findOne({ user: userId }).populate(
        "items.product",
        "name price images stock status"
    );

const sameVariant = (
    a: { color?: string; size?: string },
    b: { color?: string; size?: string }
) => (a.color ?? "") === (b.color ?? "") && (a.size ?? "") === (b.size ?? "");

export const getCart = async (req: AuthRequest, res: Response) => {
    const cart = await populatedCart(req.user!.id);
    if (!cart) return res.json({ user: req.user!.id, items: [] });
    return res.json(cart);
};

export const addToCart = async (req: AuthRequest, res: Response) => {
    const { productId, quantity, color = "", size = "" } = req.body;
    const qty = Number(quantity);

    if (!productId || !mongoose.isValidObjectId(productId)) {
        return res.status(400).json({ message: "Valid productId is required" });
    }
    if (!Number.isInteger(qty) || qty < 1) {
        return res.status(400).json({ message: "quantity must be a positive integer" });
    }

    let cart = await Cart.findOne({ user: req.user!.id });
    if (!cart) {
        cart = await Cart.create({ user: req.user!.id, items: [] });
    }

    const line = cart.items.find(
        (i) => i.product.toString() === productId && sameVariant(i, { color, size })
    );
    if (line) {
        line.quantity += qty;
    } else {
        cart.items.push({ product: productId, quantity: qty, color, size } as any);
    }
    await cart.save();

    return res.status(201).json(await populatedCart(req.user!.id));
};

export const updateCartItem = async (req: AuthRequest, res: Response) => {
    const { itemId } = req.params;
    const qty = Number(req.body.quantity);

    if (!Number.isInteger(qty) || qty < 1) {
        return res.status(400).json({ message: "quantity must be a positive integer" });
    }

    const cart = await Cart.findOne({ user: req.user!.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const line = (cart.items as any).id(itemId);
    if (!line) return res.status(404).json({ message: "Item not found" });

    line.quantity = qty;
    await cart.save();

    return res.json(await populatedCart(req.user!.id));
};

export const removeFromCart = async (req: AuthRequest, res: Response) => {
    const { itemId } = req.params;

    const cart = await Cart.findOneAndUpdate(
        { user: req.user!.id },
        { $pull: { items: { _id: itemId } } },
        { new: true }
    );
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    return res.json(await populatedCart(req.user!.id));
};

export const clearCart = async (req: AuthRequest, res: Response) => {
    await Cart.findOneAndUpdate(
        { user: req.user!.id },
        { $set: { items: [] } },
        { new: true, upsert: true }
    );
    return res.json({ user: req.user!.id, items: [] });
};

// Merges a guest cart (from localStorage) into the user's DB cart on login.
export const mergeCart = async (req: AuthRequest, res: Response) => {
    try {
        await mergeGuestCart({
            user: req.user!.id,
            guestItems: req.body.items ?? [],
        });
        // Return the populated cart so the client can render immediately.
        return res.json(await populatedCart(req.user!.id));
    } catch (err: any) {
        const status = err instanceof CartMergeError ? err.status : 400;
        return res.status(status).json({ message: err.message });
    }
};
