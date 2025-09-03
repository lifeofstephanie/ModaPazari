import { Request, Response } from "express";
import Order from "../models/order.model";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const order = new Order({
      user: req.body.user,
      products: req.body.products,
      total: req.body.total,
      status: "Pending",
    });
    await order.save();
    res.status(201).json(order);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getOrders = async (_req: Request, res: Response) => {
  const orders = await Order.find().populate("user products");
  res.json(orders);
};

export const getOrderById = async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id).populate("user products");
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
};
