import mongoose from "mongoose";
import Order from "../models/order.model";
import { expireStalePendingOrders } from "../services/orderMaintenance.service";

const makePending = () =>
  Order.create({
    buyer: new mongoose.Types.ObjectId(),
    orderItems: [
      { product: new mongoose.Types.ObjectId(), name: "X", quantity: 1, price: 100 },
    ],
    shippingAddress: {
      fullName: "A",
      phone: "1",
      addressLine1: "1 St",
      city: "L",
      state: "L",
      country: "Nigeria",
    },
    totalPrice: 100,
    status: "pending",
  });

const setReservedUntil = (id: unknown, when: Date) =>
  Order.updateOne(
    { _id: id },
    { $set: { stockReserved: true, reservedUntil: when } },
    { timestamps: false }
  );

describe("expireStalePendingOrders", () => {
  it("cancels reservations past their expiry, leaves fresh ones", async () => {
    const stale = await makePending();
    await setReservedUntil(stale._id, new Date(Date.now() - 60 * 1000));
    const fresh = await makePending();
    await setReservedUntil(fresh._id, new Date(Date.now() + 60 * 60 * 1000));

    const released = await expireStalePendingOrders();

    expect(released).toBe(1);
    expect((await Order.findById(stale._id))?.status).toBe("cancelled");
    expect((await Order.findById(fresh._id))?.status).toBe("pending");
  });

  it("does not touch paid orders", async () => {
    const paid = await makePending();
    await Order.updateOne(
      { _id: paid._id },
      {
        $set: {
          status: "paid",
          reservedUntil: new Date(Date.now() - 60 * 1000),
        },
      },
      { timestamps: false }
    );
    await expireStalePendingOrders();
    expect((await Order.findById(paid._id))?.status).toBe("paid");
  });
});
