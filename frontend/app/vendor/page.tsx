"use client";

import { BestSellingProductTable } from "./_components/bestSellingProducts";
import { RecentActivity } from "./_components/recent";
import { VendorRevenueChart } from "./_components/revenueChart";
import { Values } from "./_data/dashboardValues";

export default function Vendor() {
  return (
    <div className="bg-linear-to-b from-[#e0ebf5] to-white overflow-x-hidden min-h-screen">
      {/* Summary Cards */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 px-5 sm:px-10 py-10">
        {Values.map((item, id) => (
          <div
            key={id}
            className="p-5 rounded-2xl gap-4 bg-white shadow-md w-full flex flex-col justify-between"
          >
            <div className="flex justify-between items-center flex-wrap">
              <div>
                <p className="font-bold text-xl mb-2">{item.value}</p>
                <p className="text-[#666]">{item.name}</p>
              </div>
              <div>
                <item.icon size={30} color="#7a2048" />
              </div>
            </div>
            <div className="w-fit bg-green-300 py-1 px-3 mt-5 rounded-sm">
              <p className="text-[#7a2048] font-bold text-xs">{item.gain}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart + Recent Activity */}
      <div className="flex flex-col md:flex-row gap-5 px-5 sm:px-10 mb-10">
        <div className="w-full md:w-2/3">
          <VendorRevenueChart />
        </div>
        <div className="w-full md:w-1/3">
          <RecentActivity />
        </div>
      </div>

      {/* Best Selling Products Table */}
      <div className="px-5 sm:px-10 mb-20 overflow-x-auto">
        <BestSellingProductTable />
      </div>
    </div>
  );
}
