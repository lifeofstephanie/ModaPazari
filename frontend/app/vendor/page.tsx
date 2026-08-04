"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { BestSellingProductTable } from "./_components/bestSellingProducts";
import { RecentActivity } from "./_components/recent";
import { VendorRevenueChart } from "./_components/revenueChart";
import { Values } from "./_data/dashboardValues";

export default function Vendor() {
  return (
    <div className="min-h-screen px-5 py-8 sm:px-8">
      {/* Page header */}
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
        {Values.map((item) => {
          const Icon = item.icon;
          const up = item.trend === "up";
          const down = item.trend === "down";
          return (
            <div
              key={item.name}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-md bg-accent-soft text-accent">
                  <Icon size={18} />
                </span>
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                    up
                      ? "text-emerald-600 dark:text-emerald-400"
                      : down
                        ? "text-red-500"
                        : "text-muted"
                  }`}
                >
                  {up && <ArrowUpRight size={14} />}
                  {down && <ArrowDownRight size={14} />}
                  {item.delta}
                </span>
              </div>
              <p className="mt-4 text-2xl font-semibold tracking-tight">
                {item.value}
              </p>
              <p className="mt-1 text-sm text-muted">{item.name}</p>
            </div>
          );
        })}
      </div>

      {/* Revenue + Recent activity */}
      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        <div className="w-full lg:w-2/3">
          <VendorRevenueChart />
        </div>
        <div className="w-full lg:w-1/3">
          <RecentActivity />
        </div>
      </div>

      {/* Best selling products */}
      <div className="mt-6">
        <BestSellingProductTable />
      </div>
    </div>
  );
}
