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
import { Bar } from "react-chartjs-2";
import { PageHeader } from "../_components/pageHeader";
import { VendorRevenueChart } from "../_components/revenueChart";

ChartJS.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

const TILES = [
  { label: "Conversion rate", value: "3.8%", note: "of visitors purchase" },
  { label: "Avg. order value", value: "₦58,200", note: "per completed order" },
  { label: "Repeat buyers", value: "41%", note: "returning customers" },
  { label: "Refund rate", value: "1.4%", note: "of delivered orders" },
];

const TOP_CATEGORIES = [
  { name: "Womenswear", share: 38 },
  { name: "Accessories", share: 26 },
  { name: "Menswear", share: 19 },
  { name: "Footwear", share: 11 },
  { name: "Outerwear", share: 6 },
];

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AnalyticsPage() {
  const barData = {
    labels: WEEKDAYS,
    datasets: [
      {
        label: "Orders",
        data: [42, 55, 38, 61, 72, 88, 47],
        backgroundColor: "#7a2048",
        borderRadius: 6,
        maxBarThickness: 34,
      },
    ],
  };

  const barOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: { color: "rgba(128,128,128,0.15)" },
      },
      x: { border: { display: false }, grid: { display: false } },
    },
  };

  return (
    <div className="min-h-screen px-5 py-8 sm:px-8">
      <PageHeader
        eyebrow="Insights"
        title="Analytics"
        subtitle="Performance trends across your store."
      />

      {/* Metric tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TILES.map((t) => (
          <div key={t.label} className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted">{t.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{t.value}</p>
            <p className="mt-1 text-xs text-muted">{t.note}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="mt-6">
        <VendorRevenueChart />
      </div>

      {/* Orders + categories */}
      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        <div className="rounded-xl border border-border bg-card p-6 lg:w-3/5">
          <h2 className="text-base font-semibold">Orders this week</h2>
          <p className="text-sm text-muted">Daily order volume</p>
          <div className="mt-6 h-64">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 lg:w-2/5">
          <h2 className="text-base font-semibold">Top categories</h2>
          <p className="text-sm text-muted">Share of sales</p>
          <ul className="mt-6 space-y-4">
            {TOP_CATEGORIES.map((c) => (
              <li key={c.name}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span>{c.name}</span>
                  <span className="text-muted">{c.share}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-accent-solid"
                    style={{ width: `${c.share}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
