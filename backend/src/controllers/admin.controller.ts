import { Request, Response } from "express";
import axios from "axios";
import mongoose from "mongoose";
import User from "../models/user.model";
import Order from "../models/order.model";
import Product from "../models/product.model";
import PromoCode from "../models/promoCode.model";
import { createNotification } from "../services/notify.service";
import { sendEmail, emailTemplates } from "../services/email.service";
import { getPagination, paginated } from "../utils/pagination";

const FRONTEND = () => process.env.FRONTEND_URL || "http://localhost:3000";
const PAYSTACK_API = process.env.PAYSTACK_API || "https://api.paystack.co";

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

export const getAllUsers = async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req);
  const [items, total] = await Promise.all([
    User.find().select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(),
  ]);
  res.json(paginated(items, total, page, limit));
};

export const deleteUsers = async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  // Never delete admin accounts (including yourself) through this endpoint.
  if (user.role === "admin") {
    return res.status(403).json({ message: "Admin accounts cannot be deleted" });
  }
  await user.deleteOne();
  res.json({ message: "User Deleted" });
};

// List vendors for onboarding review, optional ?status= filter.
export const getVendors = async (req: Request, res: Response) => {
  const { status } = req.query;
  const { page, limit, skip } = getPagination(req);
  const filter: Record<string, unknown> = { role: "vendor" };
  if (status && ["pending", "approved", "rejected"].includes(String(status))) {
    filter.vendorStatus = String(status);
  }
  const [items, total] = await Promise.all([
    User.find(filter).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  res.json(paginated(items, total, page, limit));
};

// Approve / reject a vendor. Only approved vendors can list products.
export const setVendorStatus = async (req: Request, res: Response) => {
  const { status } = req.body;
  if (!["approved", "rejected", "pending"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  const vendor = await User.findOne({ _id: req.params.id, role: "vendor" });
  if (!vendor) return res.status(404).json({ message: "Vendor not found" });

  vendor.vendorStatus = status;
  await vendor.save();

  if (status === "approved") {
    await createNotification(
      vendor._id,
      "Your vendor account has been approved — you can now list products.",
      "system"
    );
    await sendEmail({
      to: vendor.email,
      subject: "You're approved to sell",
      html: emailTemplates.vendorApproved(vendor.firstName, `${FRONTEND()}/vendor`),
    });
  } else if (status === "rejected") {
    await createNotification(
      vendor._id,
      "Your vendor application was not approved.",
      "system"
    );
  }

  res.json(vendor);
};

export const getAllOrders = async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req);
  const [items, total] = await Promise.all([
    Order.find({})
      .populate("buyer orderItems.product")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(),
  ]);
  res.json(paginated(items, total, page, limit));
};

// ---- Promo codes ----------------------------------------------------------
export const getPromos = async (_req: Request, res: Response) => {
  const promos = await PromoCode.find().sort({ createdAt: -1 });
  res.json(promos);
};

export const createPromo = async (req: Request, res: Response) => {
  const { code, discountType, discountValue, maxUses, expiresAt } = req.body;
  if (
    !code ||
    !["percentage", "fixed"].includes(discountType) ||
    discountValue == null ||
    maxUses == null
  ) {
    return res.status(400).json({
      message: "code, discountType, discountValue and maxUses are required",
    });
  }
  try {
    const promo = await PromoCode.create({
      code,
      discountType,
      discountValue,
      maxUses,
      expiresAt: expiresAt || undefined,
    });
    res.status(201).json(promo);
  } catch (err: any) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "That code already exists" });
    }
    throw err;
  }
};

export const updatePromo = async (req: Request, res: Response) => {
  const promo = await PromoCode.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!promo) return res.status(404).json({ message: "Promo not found" });
  res.json(promo);
};

export const deletePromo = async (req: Request, res: Response) => {
  const promo = await PromoCode.findByIdAndDelete(req.params.id);
  if (!promo) return res.status(404).json({ message: "Promo not found" });
  res.json({ message: "Promo deleted" });
};

// Refund a paid order via Paystack, restore stock, and mark it refunded.
export const refundOrder = async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (!["paid", "shipped", "delivered"].includes(order.status)) {
    return res.status(400).json({ message: "Only paid orders can be refunded" });
  }
  if (!order.paymentReference) {
    return res.status(400).json({ message: "Order has no payment reference" });
  }

  // Call Paystack first — if the external refund fails we make no DB changes.
  try {
    await axios.post(
      `${PAYSTACK_API}/refund`,
      { transaction: order.paymentReference },
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    );
  } catch (err: any) {
    return res.status(502).json({
      message: err.response?.data?.message || "Refund failed at Paystack",
    });
  }

  // Restore stock and mark refunded atomically.
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      for (const item of order.orderItems) {
        await Product.updateOne(
          { _id: item.product },
          { $inc: { stock: item.quantity } },
          { session }
        );
      }
      order.status = "refunded";
      await order.save({ session });
    });
  } finally {
    await session.endSession();
  }

  const shortId = String(order._id).slice(-6);
  await createNotification(order.buyer, `Your order #${shortId} was refunded.`, "order");
  const buyer = await User.findById(order.buyer).select("email firstName");
  if (buyer?.email) {
    await sendEmail({
      to: buyer.email,
      subject: `Order #${shortId} refunded`,
      html: emailTemplates.orderStatus(buyer.firstName, shortId, "refunded"),
    });
  }

  res.json(order);
};

// List products for moderation, optionally filtered by ?status=pending|approved|rejected.
export const getAdminProducts = async (req: Request, res: Response) => {
  const { status } = req.query;
  const { page, limit, skip } = getPagination(req);
  const filter =
    status && ["pending", "approved", "rejected"].includes(String(status))
      ? { status: String(status) }
      : {};
  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate("vendor", "firstName lastName email storeName")
      .populate("brand category")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);
  res.json(paginated(items, total, page, limit));
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

  if (status === "approved" || status === "rejected") {
    await createNotification(
      product.vendor,
      `Your product "${product.name}" was ${status}.`,
      "system"
    );
  }

  res.json(product);
};
