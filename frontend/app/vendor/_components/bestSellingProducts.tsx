"use client";

import { Plus, Search, Star } from "lucide-react";
import { useState } from "react";
import { bestSellers } from "../_data/bestSellers";
import { AddProductModal } from "./addProductModal";

export const BestSellingProductTable = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const rowsPerPage = 4;

  const filteredData = bestSellers.filter((item) =>
    item.product.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const page = Math.min(currentPage, totalPages);
  const startIndex = (page - 1) * rowsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold">Best selling products</h2>
          <p className="text-sm text-muted">Ranked by revenue this month</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
            <Search size={16} className="text-muted" />
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-36 bg-transparent text-sm outline-none placeholder:text-muted md:w-44"
            />
          </label>
          <button
            onClick={() => setModalOpen(true)}
            aria-label="Add product"
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-accent-solid p-2 text-sm font-medium text-white transition-colors hover:bg-accent-strong sm:px-3.5 sm:py-2"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add product</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
              <th className="py-3 pr-4 font-medium">Product</th>
              <th className="py-3 pr-4 font-medium">Category</th>
              <th className="py-3 pr-4 font-medium">Price</th>
              <th className="py-3 pr-4 font-medium">Stock</th>
              <th className="py-3 pr-4 font-medium">Rating</th>
              <th className="py-3 pr-4 font-medium">Orders</th>
              <th className="py-3 pr-4 font-medium">Sales</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((item) => (
              <tr
                key={item.id}
                className="border-b border-border/60 last:border-b-0 transition-colors hover:bg-surface"
              >
                <td className="py-3 pr-4">
                  <p className="font-medium">{item.product}</p>
                  <p className="text-xs text-muted">{item.brand}</p>
                </td>
                <td className="py-3 pr-4 text-muted">{item.category}</td>
                <td className="py-3 pr-4">{item.price}</td>
                <td className="py-3 pr-4">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      item.stock <= 10
                        ? "bg-red-500/10 text-red-500"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {item.stock} in stock
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <span className="inline-flex items-center gap-1">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    {item.rating}
                  </span>
                </td>
                <td className="py-3 pr-4">{item.order}</td>
                <td className="py-3 pr-4 font-medium">{item.sales}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between text-sm text-muted">
        <span>
          Showing {currentData.length} of {filteredData.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="rounded-md border border-border px-3 py-1 transition-colors hover:bg-surface disabled:opacity-40"
          >
            Previous
          </button>
          <span className="rounded-md bg-accent-soft px-3 py-1 font-medium text-accent">
            {page}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="rounded-md border border-border px-3 py-1 transition-colors hover:bg-surface disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      <AddProductModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};
