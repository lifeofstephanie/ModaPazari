"use client";

import { Banknote, Clock, Package, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { VendorRevenueChart } from "./_components/revenueChart";
import { vendorService, type VendorStats } from "@/services/api";

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

const STATUS_LABEL: Record<string, string> = {
  pending: "placed an order",
  paid: "paid for an order",
  shipped: "order shipped",
  delivered: "order delivered",
  cancelled: "cancelled an order",
};

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export default function Vendor() {
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vendorService
      .getStats()
      .then(({ data }) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const tiles = [
    { name: "Revenue", value: stats ? naira(stats.revenue) : "—", icon: Banknote },
    { name: "Orders", value: stats?.orders ?? "—", icon: ShoppingBag },
    { name: "Products Live", value: stats?.productsLive ?? "—", icon: Package },
    { name: "Pending Review", value: stats?.productsPending ?? "—", icon: Clock },
  ];

  return (
    <div className="min-h-screen px-5 py-8 sm:px-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Overview
        </p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          Your store at a glance for the last 30 days.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.name} className="rounded-xl border border-border bg-card p-5">
              <span className="grid h-9 w-9 place-items-center rounded-md bg-accent-soft text-accent">
                <Icon size={18} />
              </span>
              <p className="mt-4 text-2xl font-semibold tracking-tight">
                {loading ? "…" : item.value}
              </p>
              <p className="mt-1 text-sm text-muted">{item.name}</p>
            </div>
          );
        })}
      </div>

      {/* Revenue + Recent activity */}
      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        <div className="w-full lg:w-2/3">
          <VendorRevenueChart monthly={stats?.monthly} />
        </div>
        <div className="w-full lg:w-1/3">
          <div className="flex h-full max-h-[512px] flex-col rounded-xl border border-border bg-card p-6">
            <h2 className="mb-5 text-base font-semibold">Recent activity</h2>
            {loading ? (
              <p className="text-sm text-muted">Loading…</p>
            ) : !stats || stats.recent.length === 0 ? (
              <p className="text-sm text-muted">No recent activity.</p>
            ) : (
              <ul className="flex-1 space-y-4 overflow-y-auto">
                {stats.recent.map((r) => (
                  <li key={r.id} className="flex items-start gap-3">
                    <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
                      {r.customer.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-snug">
                        <span className="font-medium">{r.customer}</span>{" "}
                        <span className="text-muted">
                          {STATUS_LABEL[r.status] ?? "updated an order"}
                        </span>
                      </p>
                      <p className="text-xs text-muted">
                        {r.id} · {naira(r.total)}
                      </p>
                    </div>
                    <span className="shrink-0 whitespace-nowrap text-xs text-muted">
                      {timeAgo(r.date)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Best selling products */}
      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold">Best selling products</h2>
        <p className="text-sm text-muted">Ranked by revenue</p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="py-3 pr-4 font-medium">Product</th>
                <th className="py-3 pr-4 font-medium">Price</th>
                <th className="py-3 pr-4 font-medium">Stock</th>
                <th className="py-3 pr-4 font-medium">Units sold</th>
                <th className="py-3 pr-4 font-medium">Sales</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.bestSellers ?? []).map((p) => (
                <tr key={p.id} className="border-b border-border/60 last:border-b-0">
                  <td className="py-3 pr-4 font-medium">{p.name}</td>
                  <td className="py-3 pr-4">{naira(p.price)}</td>
                  <td className="py-3 pr-4">{p.stock}</td>
                  <td className="py-3 pr-4">{p.orders}</td>
                  <td className="py-3 pr-4 font-medium">{naira(p.sales)}</td>
                </tr>
              ))}
              {(!stats || stats.bestSellers.length === 0) && !loading && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-muted">
                    No sales data yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
