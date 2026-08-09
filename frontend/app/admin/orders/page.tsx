"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminService, type ApiOrder } from "@/services/api";
import { Pager } from "../_components/pager";

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

const STATUS_STYLES: Record<ApiOrder["status"], string> = {
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  paid: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  shipped: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  delivered: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  cancelled: "bg-red-500/10 text-red-500",
  refunded: "bg-muted/20 text-muted",
};

const REFUNDABLE = ["paid", "shipped", "delivered"];

const buyerName = (b: ApiOrder["buyer"]) => {
  if (!b || typeof b === "string") return "—";
  return [b.firstName, b.lastName].filter(Boolean).join(" ") || b.email || "—";
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await adminService.getOrders(page);
      setOrders(data.items);
      setPages(data.pages);
    } catch {
      /* interceptor toasts */
    } finally {
      setLoading(false);
    }
  }, [page]);

  const refund = async (o: ApiOrder) => {
    if (!window.confirm(`Refund order #${o._id.slice(-6)}? This can't be undone.`))
      return;
    try {
      setBusyId(o._id);
      const { data } = await adminService.refundOrder(o._id);
      setOrders((list) => list.map((x) => (x._id === o._id ? data : x)));
      toast.success("Order refunded");
    } catch {
      /* interceptor toasts */
    } finally {
      setBusyId(null);
    }
  };

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
                  <th className="py-3 pr-4 text-right font-medium">Action</th>
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
                    <td className="py-3 pr-4 text-right">
                      {REFUNDABLE.includes(o.status) ? (
                        <button
                          disabled={busyId === o._id}
                          onClick={() => refund(o)}
                          className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                        >
                          Refund
                        </button>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm text-muted">
                      No orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <Pager page={page} pages={pages} onPage={setPage} />
      </div>
    </div>
  );
}
