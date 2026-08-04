import { Response } from "express";
import Product from "../models/product.model";
import { AuthRequest } from "../middleware/auth";
import Order from "../models/order.model";
import { createNotification } from "../services/notify.service";

// Only these fields may be set by a vendor. `vendor` is forced from the token
// and `status` is forced to "pending" so a vendor can't self-approve a listing.
const pickProductFields = (body: any) => ({
  name: body.name,
  description: body.description,
  price: body.price,
  stock: body.stock,
  images: body.images,
  brand: body.brand,
  category: body.category,
});

export const createProduct = async (req: AuthRequest, res: Response) => {
  const product = await Product.create({
    ...pickProductFields(req.body),
    vendor: req.user?._id,
    status: "pending",
  });
  res.status(201).json(product);
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, vendor: req.user?._id },
    pickProductFields(req.body),
    { new: true, runValidators: true }
  );

  if (!product) {
    return res.status(404).json({ message: "product not found" });
  }
  res.json(product);
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  const product = await Product.findOneAndDelete({
    _id: req.params.id,
    vendor: req.user?._id,
  });
  if (!product) {
    return res.status(404).json({ message: "product not found" });
  }
  res.json({ message: "product deleted" });
};

export const getVendorProducts = async (req: AuthRequest, res: Response) => {
  const products = await Product.find({ vendor: req.user?._id });
  res.json(products);
};

export const getVendorOrders = async (req: AuthRequest, res: Response) => {
  // Orders don't carry a vendor field, so first resolve this vendor's product
  // ids, then find orders containing any of them.
  const productIds = await Product.find({ vendor: req.user?._id }).distinct(
    "_id"
  );

  const orders = await Order.find({ "orderItems.product": { $in: productIds } })
    .populate("buyer")
    .populate("orderItems.product")
    .sort({ createdAt: -1 });

  res.json(orders);
};

// A vendor may advance the fulfilment status of an order that contains one of
// their products. Limited to shipping states; payment states are set by the PSP.
export const updateVendorOrderStatus = async (
  req: AuthRequest,
  res: Response
) => {
  const { status } = req.body;
  if (!["shipped", "delivered"].includes(status)) {
    return res
      .status(400)
      .json({ message: "Status must be 'shipped' or 'delivered'" });
  }

  const productIds = await Product.find({ vendor: req.user?._id }).distinct(
    "_id"
  );

  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, "orderItems.product": { $in: productIds } },
    { status },
    { new: true }
  )
    .populate("buyer")
    .populate("orderItems.product");

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  await createNotification(
    (order.buyer as any)?._id ?? order.buyer,
    `Your order #${String(order._id).slice(-6)} has been ${status}.`,
    "order"
  );

  res.json(order);
};

// Aggregated dashboard figures for the signed-in vendor.
export const getVendorStats = async (req: AuthRequest, res: Response) => {
  const vendorId = String(req.user?._id);

  const products = await Product.find({ vendor: req.user?._id }).select(
    "_id name price stock status"
  );
  const idSet = new Set(products.map((p) => String(p._id)));
  const productIds = products.map((p) => p._id);

  const productsLive = products.filter((p) => p.status === "approved").length;
  const productsPending = products.filter((p) => p.status === "pending").length;

  // Paid-through orders drive revenue and best-sellers.
  const paidStatuses = ["paid", "shipped", "delivered"];
  const paidOrders = await Order.find({
    status: { $in: paidStatuses },
    "orderItems.product": { $in: productIds },
  }).select("orderItems totalPrice createdAt");

  // Last 12 months buckets.
  const now = new Date();
  const months: { key: string; label: string; earnings: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleString("en-US", { month: "short" }),
      earnings: 0,
    });
  }
  const monthIndex = new Map(months.map((m, i) => [m.key, i]));

  let revenue = 0;
  const perProduct = new Map<string, { orders: number; sales: number }>();

  for (const order of paidOrders) {
    let orderTotal = 0;
    for (const item of order.orderItems) {
      const pid = String(item.product);
      if (!idSet.has(pid)) continue;
      const line = item.price * item.quantity;
      revenue += line;
      orderTotal += line;
      const acc = perProduct.get(pid) ?? { orders: 0, sales: 0 };
      acc.orders += item.quantity;
      acc.sales += line;
      perProduct.set(pid, acc);
    }
    const d = new Date((order as any).createdAt);
    const idx = monthIndex.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (idx !== undefined) months[idx].earnings += orderTotal;
  }

  const bestSellers = products
    .map((p) => {
      const acc = perProduct.get(String(p._id)) ?? { orders: 0, sales: 0 };
      return {
        id: String(p._id),
        name: p.name,
        price: p.price,
        stock: p.stock,
        orders: acc.orders,
        sales: acc.sales,
      };
    })
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  // Recent orders (any status) as an activity feed.
  const recentOrders = await Order.find({
    "orderItems.product": { $in: productIds },
  })
    .populate("buyer", "firstName lastName email")
    .sort({ createdAt: -1 })
    .limit(6);

  const recent = recentOrders.map((o) => {
    const b = o.buyer as any;
    const customer =
      [b?.firstName, b?.lastName].filter(Boolean).join(" ") ||
      b?.email ||
      "A customer";
    return {
      id: `#${String(o._id).slice(-6)}`,
      customer,
      status: o.status,
      total: o.totalPrice,
      date: (o as any).createdAt,
    };
  });

  res.json({
    revenue,
    orders: paidOrders.length,
    productsLive,
    productsPending,
    monthly: months.map((m) => ({ label: m.label, earnings: m.earnings })),
    bestSellers,
    recent,
  });
};
