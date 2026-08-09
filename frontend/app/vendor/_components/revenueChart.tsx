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

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

type Monthly = { label: string; earnings: number };

export const VendorRevenueChart = ({ monthly }: { monthly?: Monthly[] }) => {
  const hasData = !!monthly && monthly.length > 0;
  const labels = hasData ? monthly!.map((m) => m.label) : MONTHS;
  const values = hasData
    ? monthly!.map((m) => m.earnings)
    : new Array(12).fill(0);

  const data = {
    labels,
    datasets: [
      {
        label: "Earnings",
        data: values,
        borderColor: "#7a2048",
        backgroundColor: "#7a2048",
        borderWidth: 2,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
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
        ticks: {
          callback: (v) => `₦${Number(v).toLocaleString("en-NG")}`,
        },
      },
      x: { border: { display: false }, grid: { display: false } },
    },
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold">Revenue report</h2>
          <p className="text-sm text-muted">Earnings over the last 12 months</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted">
          <span className="h-2.5 w-2.5 rounded-full bg-accent-solid" />
          Earnings
        </div>
      </div>

      <div className="h-80">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};
