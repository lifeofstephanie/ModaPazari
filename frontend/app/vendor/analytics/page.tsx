"use client";

import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { PageHeader } from "../_components/pageHeader";
import { VendorRevenueChart } from "../_components/revenueChart";
import { vendorService, type VendorStats } from "@/services/api";

ChartJS.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

export default function AnalyticsPage() {
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vendorService
      .getStats()
      .then(({ data }) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const avgOrder =
    stats && stats.orders > 0 ? Math.round(stats.revenue / stats.orders) : 0;

  const tiles = [
    { label: "Revenue", value: stats ? naira(stats.revenue) : "—" },
    { label: "Orders", value: stats?.orders ?? "—" },
    { label: "Avg. order value", value: stats ? naira(avgOrder) : "—" },
    { label: "Products live", value: stats?.productsLive ?? "—" },
  ];

  const best = stats?.bestSellers ?? [];
  const totalSales = best.reduce((s, p) => s + p.sales, 0);

  const barData = {
    labels: best.map((p) => p.name),
    datasets: [
      {
        label: "Sales",
        data: best.map((p) => p.sales),
        backgroundColor: "#7a2048",
        borderRadius: 6,
        maxBarThickness: 34,
      },
    ],
  };

  const barOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `₦${Number(ctx.parsed.y).toLocaleString("en-NG")}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: { color: "rgba(128,128,128,0.15)" },
        ticks: { callback: (v) => `₦${Number(v).toLocaleString("en-NG")}` },
      },
      x: { border: { display: false }, grid: { display: false } },
    },
  };

  return (
    <div className="min-h-screen px-5 py-8 sm:px-8">
      <PageHeader
        eyebrow="Insights"
        title="Analytics"
        subtitle="Performance across your store."
      />

      {/* Metric tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted">{t.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {loading ? "…" : t.value}
            </p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="mt-6">
        <VendorRevenueChart monthly={stats?.monthly} />
      </div>

      {/* Top products + share */}
      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        <div className="rounded-xl border border-border bg-card p-6 lg:w-3/5">
          <h2 className="text-base font-semibold">Top products by revenue</h2>
          <p className="text-sm text-muted">Your best-selling items</p>
          <div className="mt-6 h-64">
            {loading ? (
              <div className="grid h-full place-items-center text-sm text-muted">
                Loading…
              </div>
            ) : best.length === 0 ? (
              <div className="grid h-full place-items-center text-sm text-muted">
                No sales data yet.
              </div>
            ) : (
              <Bar data={barData} options={barOptions} />
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 lg:w-2/5">
          <h2 className="text-base font-semibold">Sales share</h2>
          <p className="text-sm text-muted">Share of revenue by product</p>
          {best.length === 0 ? (
            <p className="mt-6 text-sm text-muted">No sales data yet.</p>
          ) : (
            <ul className="mt-6 space-y-4">
              {best.map((p) => {
                const share = totalSales > 0 ? (p.sales / totalSales) * 100 : 0;
                return (
                  <li key={p.id}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="truncate pr-2">{p.name}</span>
                      <span className="shrink-0 text-muted">
                        {share.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                      <div
                        className="h-full rounded-full bg-accent-solid"
                        style={{ width: `${share}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
