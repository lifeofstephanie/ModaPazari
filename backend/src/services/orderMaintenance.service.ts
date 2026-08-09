import mongoose from "mongoose";
import Order from "../models/order.model";
import { restoreStock } from "./stock.service";

/**
 * Releases expired stock reservations. Stock is reserved (decremented) at
 * checkout and held until `reservedUntil`; if payment never completes, this
 * sweep restores the stock and cancels the order — so unpaid carts can't hold
 * inventory forever. Each order is processed in its own transaction and re-read
 * under `status: "pending"` so a payment landing concurrently is never clobbered.
 *
 * Returns the number of reservations released.
 */
export const expireStalePendingOrders = async (): Promise<number> => {
  const stale = await Order.find({
    status: "pending",
    reservedUntil: { $lt: new Date() },
  })
    .select("_id")
    .limit(200);

  let released = 0;

  for (const { _id } of stale) {
    const session = await mongoose.startSession();
    let didRelease = false;
    try {
      await session.withTransaction(async () => {
        didRelease = false;
        const order = await Order.findOne({
          _id,
          status: "pending",
        }).session(session);
        if (!order) return; // already paid/cancelled by another path

        if (order.stockReserved) {
          for (const item of order.orderItems) {
            await restoreStock(session, item.product, item.size, item.quantity);
          }
        }
        order.status = "cancelled";
        order.stockReserved = false;
        order.reservedUntil = undefined;
        await order.save({ session });
        didRelease = true;
      });
    } catch (err) {
      console.error("[maintenance] failed to release order", String(_id), err);
    } finally {
      await session.endSession();
    }
    if (didRelease) released++;
  }

  if (released > 0) {
    console.log(`[maintenance] released ${released} expired reservation(s)`);
  }
  return released;
};

/**
 * Runs the sweep now and then every 5 minutes. Called once from server startup.
 */
export const startOrderMaintenance = (): void => {
  const run = () => {
    expireStalePendingOrders().catch((err) =>
      console.error("[maintenance] sweep failed:", err)
    );
  };
  run();
  setInterval(run, 5 * 60 * 1000).unref();
};
