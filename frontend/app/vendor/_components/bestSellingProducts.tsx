"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { bestSellers } from "../_data/bestSellers";
import { AddProductModal } from "./addProductModal";

export const BestSellingProductTable = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const rowsPerPage = 4;

  const filteredData = bestSellers.filter((item) =>
    item.product.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      {/* Header */}
      <div className="flex max-md:flex-col md:items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Best Selling Product
        </h2>

        <div className="flex max-md:flex-col md:items-center gap-3">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm md:w-40"
          />
          <div className="hidden max-md:flex justify-end gap-3">
            <select className="border rounded-lg px-3 py-2 text-sm border-[#ccc]">
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>

            <select className="border rounded-lg px-3 py-2 text-sm border-[#ccc]">
              <option>10 Row</option>
              <option>20 Row</option>
            </select>
            <div
              className="border rounded-lg px-3 py-2 text-sm border-[#ccc] flex gap-2 cursor-pointer"
              onClick={() => setModalOpen(true)}
            >
              <PlusIcon size={18} />
              <p>Add</p>
            </div>
            <button className="text-gray-400 text-xl">⋮</button>
          </div>

          <select className="border rounded-lg px-3 py-2 text-sm border-[#ccc] max-md:hidden ">
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>

          <select className="border rounded-lg px-3 py-2 text-sm border-[#ccc] max-md:hidden">
            <option>10 Row</option>
            <option>20 Row</option>
          </select>

          <div
            className="border rounded-lg px-3 py-2 text-sm border-[#ccc] flex gap-2 cursor-pointer max-md:hidden"
            onClick={() => setModalOpen(true)}
          >
            <PlusIcon size={18} />
            <p>Add</p>
          </div>

          <button className="text-gray-400 text-xl max-md:hidden">⋮</button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">PRODUCT</th>
              <th className="px-4 py-3 text-left">CATEGORY</th>
              <th className="px-4 py-3 text-left">BRAND</th>
              <th className="px-4 py-3 text-left">PRICE</th>
              <th className="px-4 py-3 text-left">STOCK</th>
              <th className="px-4 py-3 text-left">RATING</th>
              <th className="px-4 py-3 text-left">ORDER</th>
              <th className="px-4 py-3 text-left">SALES</th>
              <th className="px-4 py-3 text-center">ACTION</th>
            </tr>
          </thead>

          <tbody>
            {currentData.map((item) => (
              <tr
                key={item.id}
                className="border-b last:border-b-0 border-b-[#ccc]/20"
              >
                <td className="px-4 py-3">{item.id}</td>
                <td className="px-4 py-3 font-medium text-gray-800">
                  {item.product}
                </td>
                <td className="px-4 py-3">{item.category}</td>
                <td className="px-4 py-3">{item.brand}</td>
                <td className="px-4 py-3">{item.price}</td>
                <td className="px-4 py-3">{item.stock}</td>
                <td className="px-4 py-3">{item.rating}</td>
                <td className="px-4 py-3">{item.order}</td>
                <td className="px-4 py-3">{item.sales}</td>
                <td className="px-4 py-3 text-center text-xl">⋯</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
        <span>
          Showing {currentData.length} of {filteredData.length} Result
        </span>

        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 border rounded-md disabled:opacity-40"
          >
            Previous
          </button>

          <span className="px-3 py-1 bg-gray-900 text-white rounded-md">
            {currentPage}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 border rounded-md disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
      <AddProductModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};
