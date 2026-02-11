"use client";

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
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

export const VendorRevenueChart = () => {
  const data = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Earnings",
        data: [
          12000, 23000, 14000, 32000, 20000, 30000, 24000, 15000, 25000, 27000,
          22000, 18000,
        ],
        borderColor: "#2563EB", // blue
        backgroundColor: "rgba(37, 99, 235, 0.1)",
        tension: 0.4,
        pointRadius: 4,
      },
      {
        label: "Goods Sold",
        data: [
          8000, 20000, 8500, 18000, 2000, 15000, 12000, 9000, 14000, 16000,
          13000, 11000,
        ],
        borderColor: "#F59E0B", // amber
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        tension: 0.4,
        pointRadius: 4,
      },
      {
        label: "Profit",
        data: [
          4000, 20000, 5500, 16000, 7000, 25000, 12000, 6000, 11000, 13000,
          9000, 7000,
        ],
        borderColor: "#10B981", // green
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        pointRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // we are using a custom header legend
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "#E5E7EB",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm nd:h-[400px]">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-10 mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Revenue report</h2>

        <div className="flex items-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-md bg-[#2563EB]" />
            Earnings
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-md bg-[#F59E0B]" />
            Goods Sold
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-md bg-[#10B981]" />
            Profit
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};
