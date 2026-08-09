import { Response } from "express";
import Product from "../models/product.model";
import { AuthRequest } from "../middleware/auth";
import Order from "../models/order.model";
import User from "../models/user.model";
import { createNotification } from "../services/notify.service";
import { sendEmail, emailTemplates } from "../services/email.service";
import {
  listBanks,
  resolveAccount,
  createSubaccount,
} from "../services/paystackPayout.service";
import { toNaira } from "../utils/money";

// Only these fields may be set by a vendor. `vendor` is forced from the token
// and `status` is forced to "pending" so a vendor can't self-approve a listing.
const capArray = (v: unknown, max: number) =>
  Array.isArray(v) ? v.slice(0, max) : v;

// Normalise size variants: valid { size, stock } rows only, deduped by size.
const cleanVariants = (v: unknown): { size: string; stock: number }[] => {
  if (!Array.isArray(v)) return [];
  const seen = new Set<string>();
  const out: { size: string; stock: number }[] = [];
  for (const row of v.slice(0, 20)) {
    const size = String(row?.size ?? "").trim();
    const stock = Math.max(0, Math.floor(Number(row?.stock) || 0));
    if (!size || seen.has(size)) continue;
    seen.add(size);
    out.push({ size, stock });
  }
  return out;
};

const pickProductFields = (body: any) => {
  const variants = cleanVariants(body.variants);
  // For sized products the aggregate stock is the sum of variant stocks.
  const stock =
    variants.length > 0
      ? variants.reduce((s, v) => s + v.stock, 0)
      : Math.max(0, Math.floor(Number(body.stock) || 0));
  const DEPARTMENTS = [
    "clothes", "accessories", "footwear", "bags", "jewelry", "beauty", "other",
  ];
  const SEASONS = ["winter", "summer", "autumn", "spring", "none"];
  const department = DEPARTMENTS.includes(body.department)
    ? body.department
    : "other";
  // Season only applies to clothes.
  const season =
    department === "clothes" && SEASONS.includes(body.season)
      ? body.season
      : "none";

  return {
    name: body.name,
    description: body.description,
    price: toNaira(body.price), // integer naira only — no fractional money
    stock,
    variants,
    images: capArray(body.images, 10),
    colors: capArray(body.colors, 20),
    department,
    season,
    brand: body.brand,
  };
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  // Only approved vendors may list products.
  if ((req.user as any)?.vendorStatus !== "approved") {
    return res.status(403).json({
      message: "Your vendor account is pending approval",
    });
  }
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

// Bank list for the payout-account dropdown.
export const getBanks = async (_req: AuthRequest, res: Response) => {
  try {
    const banks = await listBanks();
    res.json(banks);
  } catch (err: any) {
    console.error("getBanks error:", err.response?.data || err.message);
    res.status(502).json({ message: "Could not load banks" });
  }
};

// Current payout-account status for the vendor settings page.
export const getPayoutAccount = async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user?._id).select(
    "bankName accountNumber paystackSubaccount"
  );
  res.json({
    connected: !!user?.paystackSubaccount,
    bankName: user?.bankName,
    accountNumber: user?.accountNumber,
  });
};

// Verify bank details, create a Paystack subaccount, and store it. Payments for
// this vendor's orders are then split to them automatically.
export const setupPayoutAccount = async (req: AuthRequest, res: Response) => {
  const { bankName, bankCode, accountNumber } = req.body;
  if (!bankName || !bankCode || !accountNumber) {
    return res
      .status(400)
      .json({ message: "bankName, bankCode and accountNumber are required" });
  }

  try {
    // Confirm the account resolves before creating the subaccount.
    const accountName = await resolveAccount(accountNumber, bankCode);

    const user = await User.findById(req.user?._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const businessName = user.storeName || accountName || `${user.firstName} ${user.lastName}`;
    const subaccountCode = await createSubaccount({
      businessName,
      bankCode,
      accountNumber,
    });

    user.bankName = bankName;
    user.bankCode = bankCode;
    user.accountNumber = accountNumber;
    user.paystackSubaccount = subaccountCode;
    await user.save();

    res.json({ connected: true, accountName, bankName, accountNumber });
  } catch (err: any) {
    console.error("setupPayoutAccount error:", err.response?.data || err.message);
    res.status(502).json({
      message:
        err.response?.data?.message || "Could not verify account or create payout profile",
    });
  }
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

  const order = await Order.findById(req.params.id)
    .populate("buyer")
    .populate("orderItems.product");

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  // Guard against cross-vendor tampering: a vendor may only change the status
  // of an order whose items ALL belong to them. Mixed-vendor orders would need
  // per-vendor fulfilment tracking and can't be advanced wholesale here.
  const vendorId = String(req.user?._id);
  const allMine =
    order.orderItems.length > 0 &&
    order.orderItems.every((i) => {
      const p = i.product as any;
      return p && String(p.vendor) === vendorId;
    });

  if (!allMine) {
    return res.status(403).json({
      message: "This order contains items from other vendors",
    });
  }

  order.status = status;
  await order.save();

  const shortId = String(order._id).slice(-6);
  await createNotification(
    (order.buyer as any)?._id ?? order.buyer,
    `Your order #${shortId} has been ${status}.`,
    "order"
  );

  const buyer = order.buyer as any;
  if (buyer?.email) {
    await sendEmail({
      to: buyer.email,
      subject: `Order #${shortId} ${status}`,
      html: emailTemplates.orderStatus(buyer.firstName, shortId, status),
    });
  }

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
