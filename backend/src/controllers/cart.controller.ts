import { Request, Response } from "express";
import Cart from "../models/cart.model";
import { mergeGuestCart, CartMergeError } from "../services/cartMerge.service";

export const addToCart = async (req: Request, res: Response) => {
    const { productId, quantity } = req.body;

    const qty = Number(quantity);
    if (!productId || !Number.isInteger(qty) || qty < 1) {
        return res
            .status(400)
            .json({ message: "productId and a positive integer quantity are required" });
    }

    const cart = await Cart.findOne({ user: req.user!.id });

    if (cart) {
        const item = cart.items.find((i) => i.product.toString() === productId);
        if (item) {
            item.quantity += qty;
        } else {
            cart.items.push({ product: productId, quantity: qty });
        }
        await cart.save();
        return res.json(cart);
    } else {
        const newCart = await Cart.create({
            user: req.user!.id,
            items: [{ product: productId, quantity: qty }],
        });
        return res.status(201).json(newCart);
    }
};

export const getCart = async (req: Request, res: Response) => {
    const cart = await Cart.findOne({ user: req.user!.id }).populate(
        "items.product"
    );

    if (!cart) {
        // Treat "no cart yet" as an empty cart rather than a 404 so the client
        // has a consistent shape to render.
        return res.json({ user: req.user!.id, items: [] });
    }
    return res.json(cart);
};

// Merges a guest cart (from localStorage) into the user's DB cart on login.
// Returns the merged items plus a warning summary (dropped/capped/price changes).
export const mergeCart = async (req: Request, res: Response) => {
    try {
        const result = await mergeGuestCart({
            user: req.user!.id,
            guestItems: req.body.items ?? [],
        });
        return res.json(result);
    } catch (err: any) {
        const status = err instanceof CartMergeError ? err.status : 400;
        return res.status(status).json({ message: err.message });
    }
};

// Removes a single line item. Previously this cleared the whole cart.
export const removeFromCart = async (req: Request, res: Response) => {
    const { productId } = req.params;

    const cart = await Cart.findOneAndUpdate(
        { user: req.user!.id },
        { $pull: { items: { product: productId } } },
        { new: true }
    );

    if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
    }
    return res.json(cart);
};
