"use client";

import { X } from "lucide-react";

export const AddProductModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 ">
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
        <div className="relative bg-white w-full max-w-lg rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#666]">Add Product</h2>
            <button
              onClick={onClose}
              className="text-[#ccc] hover:text-red-500"
            >
              <X />
            </button>
          </div>
          <form action="" className="space-y-4">
            <div>
              <label htmlFor="" className="text-sm text-[#666]">
                Product Name
              </label>
              <input
                type="text"
                placeholder="Enter product name"
                className="w-full border border-[#ccc] rounded-lg px-3 py-2 mt-1 text-sm"
              />
            </div>
            <div>
              <label htmlFor="" className="text-sm text-[#666]">
                Product Description
              </label>
              <input
                type="text"
                placeholder="Enter product description"
                className="w-full border border-[#ccc] rounded-lg px-3 py-2 mt-1 text-sm"
              />
            </div>
            <div>
              <label htmlFor="" className="text-sm text-[#666]">
                Product Image
              </label>
              <input
                type="file"
                placeholder="Enter product image"
                className="w-full border border-[#ccc] rounded-lg px-3 py-2 mt-1 text-sm"
              />
            </div>
            <div>
              <label htmlFor="" className="text-sm text-[#666]">
                Brand
              </label>
              <input
                type="text"
                placeholder="Enter brand name"
                className="w-full border border-[#ccc] rounded-lg px-3 py-2 mt-1 text-sm"
              />
            </div>
            <div>
              <label htmlFor="" className="text-sm text-[#666]">
                Price
              </label>
              <input
                type="number"
                placeholder="#0.00"
                className="w-full border border-[#ccc] rounded-lg px-3 py-2 mt-1 text-sm"
              />
            </div>
            <div>
              <label htmlFor="" className="text-sm text-[#666]">
                Stock
              </label>
              <input
                type="number"
                placeholder="0"
                className="w-full border border-[#ccc] rounded-lg px-3 py-2 mt-1 text-sm"
              />
            </div>
            <div>
              <label htmlFor="" className="text-sm text-[#666]">
                Category
              </label>
              <select
                name=""
                id=""
                className="w-full border border-[#ccc] rounded-lg px-3 py-2 mt-1 text-sm"
              >
                <option value="">Select Category</option>
                <option value="">Summer</option>
                <option value="">Winter</option>
                <option value="">Accessories</option>
                <option value="">Others</option>
              </select>
            </div>
            <div className="flex justify-end gap-5 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[#7a2048] rounded-lg text-sm hover:bg-[#7a2048] hover:text-white transition-colors duration-500"
              >
                <p>Cancel</p>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[#7a2048] rounded-lg text-sm bg-[#7a2048] text-white hover:bg-white hover:text-black transition-colors duration-500"
              >
                <p>Add Product</p>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
