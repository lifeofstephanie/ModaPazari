import mongoose from "mongoose";
import User from "../models/user.model";
import Product from "../models/product.model";
import Order from "../models/order.model";
import { createPendingOrder, OrderError } from "../services/order.service";

const ADDRESS = {
  fullName: "Ada Buyer",
  phone: "08000000000",
  addressLine1: "1 Market Rd",
  city: "Lagos",
  state: "Lagos",
  country: "Nigeria",
};

const makeVendor = () =>
  User.create({
    firstName: "Vend",
    lastName: "Or",
    email: `vendor${Math.random().toString(36).slice(2)}@test.com`,
    password: "password123",
    role: "vendor",
    vendorStatus: "approved",
  });

const makeProduct = (vendorId: unknown, over: Record<string, unknown> = {}) =>
  Product.create({
    name: "Silk Tee",
    description: "A tee",
    price: 5000,
    stock: 10,
    vendor: vendorId,
    status: "approved",
    ...over,
  });

describe("createPendingOrder", () => {
  it("re-prices from the DB and snapshots name + total", async () => {
    const vendor = await makeVendor();
    const product = await makeProduct(vendor._id);

    const order = await createPendingOrder({
      buyer: String(vendor._id),
      items: [{ product: String(product._id), quantity: 2 }],
      shippingAddress: ADDRESS,
    });

    // subtotal is the DB-priced line total; totalPrice additionally includes
    // VAT + shipping (see pricing.service), so we assert on subtotal here.
    expect(order.subtotal).toBe(10000);
    expect(order.orderItems[0].price).toBe(5000);
    expect(order.orderItems[0].name).toBe("Silk Tee");
    expect(order.status).toBe("pending");
  });

  it("ignores a tampered client price (uses DB price)", async () => {
    const vendor = await makeVendor();
    const product = await makeProduct(vendor._id, { price: 5000 });

    const order = await createPendingOrder({
      buyer: String(vendor._id),
      // even if a client sent a fake price, the service never reads it
      items: [{ product: String(product._id), quantity: 1 }],
      shippingAddress: ADDRESS,
    });
    expect(order.subtotal).toBe(5000);
  });

  it("rejects an unapproved product", async () => {
    const vendor = await makeVendor();
    const product = await makeProduct(vendor._id, { status: "pending" });
    await expect(
      createPendingOrder({
        buyer: String(vendor._id),
        items: [{ product: String(product._id), quantity: 1 }],
        shippingAddress: ADDRESS,
      })
    ).rejects.toThrow(OrderError);
  });

  it("rejects insufficient stock", async () => {
    const vendor = await makeVendor();
    const product = await makeProduct(vendor._id, { stock: 1 });
    await expect(
      createPendingOrder({
        buyer: String(vendor._id),
        items: [{ product: String(product._id), quantity: 5 }],
        shippingAddress: ADDRESS,
      })
    ).rejects.toThrow(/stock/i);
  });

  it("requires a shipping address", async () => {
    const vendor = await makeVendor();
    const product = await makeProduct(vendor._id);
    await expect(
      createPendingOrder({
        buyer: String(vendor._id),
        items: [{ product: String(product._id), quantity: 1 }],
        shippingAddress: undefined as never,
      })
    ).rejects.toThrow(/address/i);
  });

  it("is idempotent for a repeated idempotencyKey", async () => {
    const vendor = await makeVendor();
    const product = await makeProduct(vendor._id);
    const idempotencyKey = "checkout-abc-123";

    const first = await createPendingOrder({
      buyer: String(vendor._id),
      items: [{ product: String(product._id), quantity: 1 }],
      shippingAddress: ADDRESS,
      idempotencyKey,
    });
    const second = await createPendingOrder({
      buyer: String(vendor._id),
      items: [{ product: String(product._id), quantity: 1 }],
      shippingAddress: ADDRESS,
      idempotencyKey,
    });

    expect(String(first._id)).toBe(String(second._id));
    expect(await Order.countDocuments()).toBe(1);
  });

  it("reserves (decrements) stock at order creation", async () => {
    const vendor = await makeVendor();
    const product = await makeProduct(vendor._id, { stock: 10 });
    await createPendingOrder({
      buyer: String(vendor._id),
      items: [{ product: String(product._id), quantity: 3 }],
      shippingAddress: ADDRESS,
    });
    const fresh = await Product.findById(product._id);
    expect(fresh?.stock).toBe(7); // stock is held on reservation
  });

  it("reserves against the per-size variant", async () => {
    const vendor = await makeVendor();
    const product = await makeProduct(vendor._id, {
      stock: 8,
      variants: [
        { size: "S", stock: 3 },
        { size: "M", stock: 5 },
      ],
    });
    await createPendingOrder({
      buyer: String(vendor._id),
      items: [{ product: String(product._id), quantity: 2, size: "S" }],
      shippingAddress: ADDRESS,
    });
    const fresh = await Product.findById(product._id);
    const sVariant = fresh?.variants.find((v) => v.size === "S");
    expect(sVariant?.stock).toBe(1);
    expect(fresh?.stock).toBe(6); // aggregate mirror also decremented
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase().catch(() => {});
});
