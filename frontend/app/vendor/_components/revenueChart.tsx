"use client";

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

const SERIES = [
  { label: "Earnings", color: "#7a2048", data: [12, 23, 14, 32, 20, 30, 24, 15, 25, 27, 22, 18] },
  { label: "Goods Sold", color: "#2f6f6a", data: [8, 20, 8.5, 18, 12, 15, 12, 9, 14, 16, 13, 11] },
  { label: "Profit", color: "#b07d2b", data: [4, 20, 5.5, 16, 7, 25, 12, 6, 11, 13, 9, 7] },
];

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const VendorRevenueChart = () => {
  const data = {
    labels: MONTHS,
    datasets: SERIES.map((s) => ({
      label: s.label,
      data: s.data,
      borderColor: s.color,
      backgroundColor: s.color,
      borderWidth: 2,
      tension: 0.35,
      pointRadius: 0,
      pointHoverRadius: 4,
    })),
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ₦${ctx.parsed.y}k`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: { color: "rgba(128,128,128,0.15)" },
        ticks: { callback: (v) => `₦${v}k` },
      },
      x: {
        border: { display: false },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold">Revenue report</h2>
          <p className="text-sm text-muted">Monthly performance</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          {SERIES.map((s) => (
            <div key={s.label} className="flex items-center gap-2 text-muted">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              {s.label}
            </div>
          ))}
        </div>
      </div>

      <div className="h-80">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};
