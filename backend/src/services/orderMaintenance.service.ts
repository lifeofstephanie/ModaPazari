import Order from "../models/order.model";

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

/**
 * Cancels orders left "pending" (unpaid) for more than 2 days.
 *
 * Pending orders never had stock decremented (that happens on payment), so
 * cancelling is a plain status update — no stock to restore. Returns the number
 * of orders cancelled.
 */
export const expireStalePendingOrders = async (): Promise<number> => {
  const cutoff = new Date(Date.now() - TWO_DAYS_MS);
  const result = await Order.updateMany(
    { status: "pending", createdAt: { $lt: cutoff } },
    { $set: { status: "cancelled" } }
  );
  const count = result.modifiedCount ?? 0;
  if (count > 0) {
    console.log(`[maintenance] cancelled ${count} stale pending order(s)`);
  }
  return count;
};

/**
 * Runs the sweep now and then hourly. Called once from server startup. Each run
 * is guarded so a failure never crashes the process.
 */
export const startOrderMaintenance = (): void => {
  const run = () => {
    expireStalePendingOrders().catch((err) =>
      console.error("[maintenance] sweep failed:", err)
    );
  };
  run();
  setInterval(run, 60 * 60 * 1000).unref();
};
