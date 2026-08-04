"use client";

import { Banknote, Clock, Package, ShoppingBag, Store, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { adminService, type AdminStats } from "@/services/api";

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getStats()
      .then(({ data }) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const tiles = [
    { label: "Revenue", value: stats ? naira(stats.revenue) : "—", icon: Banknote },
    { label: "Orders", value: stats?.orders ?? "—", icon: ShoppingBag },
    { label: "Buyers", value: stats?.users ?? "—", icon: Users },
    { label: "Vendors", value: stats?.vendors ?? "—", icon: Store },
    { label: "Live products", value: stats?.approvedProducts ?? "—", icon: Package },
    { label: "Pending review", value: stats?.pendingProducts ?? "—", icon: Clock },
  ];

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Overview
        </p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Admin dashboard</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <div key={t.label} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-md bg-accent-soft text-accent">
                  <Icon size={18} />
                </span>
              </div>
              <p className="mt-4 text-2xl font-semibold tracking-tight">
                {loading ? "…" : t.value}
              </p>
              <p className="mt-1 text-sm text-muted">{t.label}</p>
            </div>
          );
        })}
      </div>

      {!loading && stats && stats.pendingProducts > 0 && (
        <Link
          href="/admin/products"
          className="mt-6 flex items-center justify-between rounded-xl border border-accent/40 bg-accent-soft p-5 transition-colors hover:border-accent"
        >
          <div>
            <p className="font-medium text-accent">
              {stats.pendingProducts} product
              {stats.pendingProducts === 1 ? "" : "s"} awaiting review
            </p>
            <p className="text-sm text-muted">
              Approve them so they appear in the shop.
            </p>
          </div>
          <span className="text-sm font-medium text-accent">Review →</span>
        </Link>
      )}
    </div>
  );
}
