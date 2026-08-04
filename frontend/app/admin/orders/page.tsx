"use client";

import { useCallback, useEffect, useState } from "react";
import { adminService, type ApiOrder } from "@/services/api";

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

const STATUS_STYLES: Record<ApiOrder["status"], string> = {
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  paid: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  shipped: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  delivered: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  cancelled: "bg-red-500/10 text-red-500",
};

const buyerName = (b: ApiOrder["buyer"]) => {
  if (!b || typeof b === "string") return "—";
  return [b.firstName, b.lastName].filter(Boolean).join(" ") || b.email || "—";
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await adminService.getOrders();
      setOrders(data);
    } catch {
      /* interceptor toasts */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Commerce
        </p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Orders</h1>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <p className="mb-5 text-sm text-muted">
          {loading ? "Loading…" : `${orders.length} orders`}
        </p>

        {loading ? (
          <div className="py-16 text-center text-sm text-muted">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-3 pr-4 font-medium">Order</th>
                  <th className="py-3 pr-4 font-medium">Customer</th>
                  <th className="py-3 pr-4 font-medium">Items</th>
                  <th className="py-3 pr-4 font-medium">Total</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 pr-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr
                    key={o._id}
                    className="border-b border-border/60 last:border-b-0"
                  >
                    <td className="py-3 pr-4 font-medium">#{o._id.slice(-6)}</td>
                    <td className="py-3 pr-4">{buyerName(o.buyer)}</td>
                    <td className="py-3 pr-4">
                      {o.orderItems.reduce((n, i) => n + i.quantity, 0)}
                    </td>
                    <td className="py-3 pr-4 font-medium">{naira(o.totalPrice)}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[o.status]}`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-muted">
                      {o.createdAt
                        ? new Date(o.createdAt).toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm text-muted">
                      No orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
