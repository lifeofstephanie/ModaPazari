import { Request, Response } from "express";
import User from "../models/user.model";
import Order from "../models/order.model";
import Product from "../models/product.model";

export const getStats = async (_req: Request, res: Response) => {
  const [users, vendors, orders, pendingProducts, approvedProducts] =
    await Promise.all([
      User.countDocuments({ role: "buyer" }),
      User.countDocuments({ role: "vendor" }),
      Order.countDocuments({}),
      Product.countDocuments({ status: "pending" }),
      Product.countDocuments({ status: "approved" }),
    ]);

  // Revenue from paid/shipped/delivered orders.
  const revenueAgg = await Order.aggregate([
    { $match: { status: { $in: ["paid", "shipped", "delivered"] } } },
    { $group: { _id: null, total: { $sum: "$totalPrice" } } },
  ]);
  const revenue = revenueAgg[0]?.total ?? 0;

  res.json({ users, vendors, orders, pendingProducts, approvedProducts, revenue });
};

export const getAllUsers = async (_req: Request, res: Response) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
};

export const deleteUsers = async (req: Request, res: Response) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ message: "User Deleted" });
};

export const getAllOrders = async (_req: Request, res: Response) => {
  const orders = await Order.find({})
    .populate("buyer orderItems.product")
    .sort({ createdAt: -1 });
  res.json(orders);
};

// List products for moderation, optionally filtered by ?status=pending|approved|rejected.
export const getAdminProducts = async (req: Request, res: Response) => {
  const { status } = req.query;
  const filter =
    status && ["pending", "approved", "rejected"].includes(String(status))
      ? { status: String(status) }
      : {};
  const products = await Product.find(filter)
    .populate("vendor", "firstName lastName email storeName")
    .populate("brand category")
    .sort({ createdAt: -1 });
  res.json(products);
};

// Approve or reject a product — this is what makes a listing visible in the feed.
export const setProductStatus = async (req: Request, res: Response) => {
  const { status } = req.body;
  if (!["approved", "rejected", "pending"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
};
