"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import toast from "react-hot-toast";
import {
  orders as seedOrders,
  type OrderStatus,
  type VendorOrder,
} from "../_data/orders";
import { InvoiceModal } from "./invoiceModal";
import { PageHeader } from "./pageHeader";

const STATUS_STYLES: Record<OrderStatus, string> = {
  Pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Processing: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Shipped: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  Delivered: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

// The order a pending order advances through when the vendor clicks "Manage".
const NEXT_STATUS: Record<OrderStatus, OrderStatus> = {
  Pending: "Processing",
  Processing: "Shipped",
  Shipped: "Delivered",
  Delivered: "Delivered",
};

type OrdersViewProps = {
  variant: "open" | "completed";
};

export const OrdersView = ({ variant }: OrdersViewProps) => {
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState<VendorOrder[]>(seedOrders);
  const [invoice, setInvoice] = useState<VendorOrder | null>(null);

  const isOpen = variant === "open";

  const base = orders.filter((o) =>
    variant === "completed" ? o.status === "Delivered" : o.status !== "Delivered"
  );

  const rows = base.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase())
  );

  const advance = (order: VendorOrder) => {
    const next = NEXT_STATUS[order.status];
    setOrders((list) =>
      list.map((o) => (o.id === order.id ? { ...o, status: next } : o))
    );
    toast.success(`Order ${order.id} marked ${next}`);
  };

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
            {rows.length} {rows.length === 1 ? "order" : "orders"}
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
              {rows.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-border/60 last:border-b-0 transition-colors hover:bg-surface"
                >
                  <td className="py-3 pr-4 font-medium">{o.id}</td>
                  <td className="py-3 pr-4">{o.customer}</td>
                  <td className="py-3 pr-4 text-muted">{o.date}</td>
                  <td className="py-3 pr-4">{o.items}</td>
                  <td className="py-3 pr-4 font-medium">{o.total}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        o.payment === "Paid"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {o.payment}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[o.status]}`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right">
                    {isOpen ? (
                      <button
                        onClick={() => advance(o)}
                        className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-accent transition-colors hover:bg-accent-soft"
                      >
                        Advance
                      </button>
                    ) : (
                      <button
                        onClick={() => setInvoice(o)}
                        className="text-sm font-medium text-accent hover:text-accent-strong"
                      >
                        View
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm text-muted">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <InvoiceModal order={invoice} onClose={() => setInvoice(null)} />
    </div>
  );
};
