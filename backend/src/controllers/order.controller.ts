import { Request, Response } from "express";
import Order from "../models/order.model";
import {
  createOrder as createOrderService,
  createPendingOrder,
  OrderError,
} from "../services/order.service";
import { applyPromoCodeAndCheckout } from "../services/promoCheckout.service";
import { AuthRequest } from "../middleware/auth";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const order = await createOrderService({
      buyer: req.body.buyer,
      orderItems: req.body.orderItems,
      totalPrice: req.body.totalPrice,
    });
    res.status(201).json(order);
  } catch (err: any) {
    const status = err instanceof OrderError ? err.status : 400;
    res.status(status).json({ message: err.message });
  }
};

// Creates a pending order for a pay-now (Paystack) checkout. Buyer comes from
// the token; items are re-priced server-side. Follow with POST /api/payment/initiate.
// Send an Idempotency-Key header (or body.idempotencyKey) to make it double-click safe.
export const checkout = async (req: AuthRequest, res: Response) => {
  try {
    const idempotencyKey =
      (req.headers["idempotency-key"] as string | undefined) ||
      req.body.idempotencyKey;

    const order = await createPendingOrder({
      buyer: String(req.user?._id),
      items: req.body.items,
      shippingAddress: req.body.shippingAddress,
      idempotencyKey,
    });
    res.status(201).json(order);
  } catch (err: any) {
    const status = err instanceof OrderError ? err.status : 400;
    res.status(status).json({ message: err.message });
  }
};

export const promoCheckout = async (req: Request, res: Response) => {
  try {
    const order = await applyPromoCodeAndCheckout({
      buyer: req.body.buyer,
      promoCode: req.body.promoCode,
      orderItems: req.body.orderItems,
    });
    res.status(201).json(order);
  } catch (err: any) {
    const status = err instanceof OrderError ? err.status : 400;
    res.status(status).json({ message: err.message });
  }
};

export const getOrders = async (_req: Request, res: Response) => {
  const orders = await Order.find().populate("buyer orderItems.product");
  res.json(orders);
};

export const getOrderById = async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id).populate(
    "buyer orderItems.product"
  );
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
};
