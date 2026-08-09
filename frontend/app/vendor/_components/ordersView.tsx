"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, Truck } from "lucide-react";
import toast from "react-hot-toast";
import { vendorService, type ApiOrder } from "@/services/api";
import type { OrderStatus, VendorOrder } from "../_data/orders";
import { InvoiceModal, type InvoiceLineItem } from "./invoiceModal";
import { PageHeader } from "./pageHeader";

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

const STATUS_STYLES: Record<OrderStatus, string> = {
  Pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Processing: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Shipped: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  Delivered: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

// Maps backend order status to the display vocabulary used by the table.
const toDisplayStatus = (s: ApiOrder["status"]): OrderStatus => {
  switch (s) {
    case "delivered":
      return "Delivered";
    case "shipped":
      return "Shipped";
    case "paid":
      return "Processing";
    default:
      return "Pending"; // pending / cancelled
  }
};

const buyerName = (b: ApiOrder["buyer"]) => {
  if (!b || typeof b === "string") return "Customer";
  return [b.firstName, b.lastName].filter(Boolean).join(" ") || b.email || "Customer";
};

const toRow = (o: ApiOrder): VendorOrder => ({
  id: `#${o._id.slice(-6)}`,
  customer: buyerName(o.buyer),
  date: o.createdAt
    ? new Date(o.createdAt).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—",
  items: o.orderItems.reduce((n, i) => n + i.quantity, 0),
  total: naira(o.totalPrice),
  status: toDisplayStatus(o.status),
  payment: o.status === "pending" || o.status === "cancelled" ? "Pending" : "Paid",
});

const toLineItems = (o: ApiOrder): InvoiceLineItem[] =>
  o.orderItems.map((i) => ({
    name: i.name || "Item",
    qty: i.quantity,
    amount: i.price * i.quantity,
    variant: [i.color, i.size].filter(Boolean).join(" · ") || undefined,
  }));

type OrdersViewProps = { variant: "open" | "completed" };

export const OrdersView = ({ variant }: OrdersViewProps) => {
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [invoice, setInvoice] = useState<{
    order: VendorOrder;
    lineItems: InvoiceLineItem[];
  } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const isOpen = variant === "open";

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await vendorService.getOrders();
      setOrders(data);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Paid -> shipped -> delivered. Only these transitions are vendor-driven.
  const advance = async (o: ApiOrder) => {
    const next = o.status === "paid" ? "shipped" : "delivered";
    try {
      setBusyId(o._id);
      const { data } = await vendorService.updateOrderStatus(o._id, next);
      setOrders((list) => list.map((x) => (x._id === o._id ? data : x)));
      toast.success(`Order #${o._id.slice(-6)} marked ${next}`);
    } catch {
      /* interceptor toasts */
    } finally {
      setBusyId(null);
    }
  };

  useEffect(() => {
    load();
  }, [load]);

  const base = orders.filter((o) =>
    variant === "completed"
      ? o.status === "delivered"
      : o.status !== "delivered" &&
        o.status !== "cancelled" &&
        o.status !== "refunded"
  );

  const rows = base
    .map((o) => ({ api: o, row: toRow(o) }))
    .filter(
      ({ row }) =>
        row.id.toLowerCase().includes(search.toLowerCase()) ||
        row.customer.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="min-h-screen px-5 py-8 sm:px-8">
      <PageHeader
        eyebrow="Orders"
        title={isOpen ? "Pending orders" : "Completed orders"}
        subtitle={
          isOpen
            ? "Orders awaiting processing, packing, or delivery."
            : "Orders that have been delivered to customers."
        }
      />

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="text-sm text-muted">
            {loading ? "Loading…" : `${rows.length} orders`}
          </p>
          <label className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
            <Search size={16} className="text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders…"
              className="w-40 bg-transparent text-sm outline-none placeholder:text-muted"
            />
          </label>
        </div>

        {error ? (
          <div className="py-16 text-center text-sm text-muted">
            Couldn&apos;t load orders.{" "}
            <button onClick={load} className="text-accent hover:underline">
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="py-16 text-center text-sm text-muted">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-3 pr-4 font-medium">Order</th>
                  <th className="py-3 pr-4 font-medium">Customer</th>
                  <th className="py-3 pr-4 font-medium">Date</th>
                  <th className="py-3 pr-4 font-medium">Items</th>
                  <th className="py-3 pr-4 font-medium">Total</th>
                  <th className="py-3 pr-4 font-medium">Payment</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 pr-4 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ api, row }) => (
                  <tr
                    key={api._id}
                    className="border-b border-border/60 last:border-b-0 transition-colors hover:bg-surface"
                  >
                    <td className="py-3 pr-4 font-medium">{row.id}</td>
                    <td className="py-3 pr-4">{row.customer}</td>
                    <td className="py-3 pr-4 text-muted">{row.date}</td>
                    <td className="py-3 pr-4">{row.items}</td>
                    <td className="py-3 pr-4 font-medium">{row.total}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          row.payment === "Paid"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {row.payment}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[row.status]}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center justify-end gap-3">
                        {isOpen && (api.status === "paid" || api.status === "shipped") && (
                          <button
                            disabled={busyId === api._id}
                            onClick={() => advance(api)}
                            className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-accent transition-colors hover:bg-accent-soft disabled:opacity-50"
                          >
                            <Truck size={13} />
                            {api.status === "paid" ? "Mark shipped" : "Mark delivered"}
                          </button>
                        )}
                        <button
                          onClick={() =>
                            setInvoice({ order: row, lineItems: toLineItems(api) })
                          }
                          className="text-sm font-medium text-accent hover:text-accent-strong"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-sm text-muted">
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <InvoiceModal
        order={invoice?.order ?? null}
        lineItems={invoice?.lineItems}
        onClose={() => setInvoice(null)}
      />
    </div>
  );
};
