"use client";

import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  AddProductModal,
  type ProductFormValues,
} from "../_components/addProductModal";
import { PageHeader } from "../_components/pageHeader";
import {
  vendorProducts,
  type ProductStatus,
  type VendorProduct,
} from "../_data/vendorProducts";

const STATUS_STYLES: Record<ProductStatus, string> = {
  Approved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Rejected: "bg-red-500/10 text-red-500",
};

const formatNaira = (n: number) => `₦${n.toLocaleString("en-NG")}`;
const parseNaira = (s: string) => Number(s.replace(/[^\d.]/g, "")) || 0;

type ModalState =
  | { mode: "add" }
  | { mode: "edit"; product: VendorProduct }
  | null;

export default function VendorProductsPage() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<VendorProduct[]>(vendorProducts);
  const [modal, setModal] = useState<ModalState>(null);

  const rows = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (product: VendorProduct) => {
    setProducts((list) => list.filter((p) => p.id !== product.id));
    toast.success(`"${product.name}" deleted`);
  };

  const handleEditSave = (id: string, values: ProductFormValues) => {
    setProducts((list) =>
      list.map((p) =>
        p.id === id
          ? {
              ...p,
              name: values.name,
              category: values.category || p.category,
              price: formatNaira(values.price),
              stock: values.stock,
            }
          : p
      )
    );
    toast.success("Product updated");
  };

  const editInitial = (p: VendorProduct) => ({
    name: p.name,
    description: "",
    price: String(parseNaira(p.price)),
    stock: String(p.stock),
    category: p.category,
  });

  return (
    <div className="min-h-screen px-5 py-8 sm:px-8">
      <PageHeader
        eyebrow="Catalog"
        title="Products"
        subtitle="Manage your listings, stock, and pricing."
        action={
          <button
            onClick={() => setModal({ mode: "add" })}
            className="inline-flex items-center gap-1.5 rounded-md bg-accent-solid px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
          >
            <Plus size={16} />
            Add product
          </button>
        }
      />

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="text-sm text-muted">{rows.length} products</p>
          <label className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
            <Search size={16} className="text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-40 bg-transparent text-sm outline-none placeholder:text-muted md:w-52"
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="py-3 pr-4 font-medium">Product</th>
                <th className="py-3 pr-4 font-medium">Category</th>
                <th className="py-3 pr-4 font-medium">Price</th>
                <th className="py-3 pr-4 font-medium">Stock</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-border/60 last:border-b-0 transition-colors hover:bg-surface"
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-md bg-accent-soft text-xs font-semibold text-accent">
                        {p.name.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-muted">{p.category}</td>
                  <td className="py-3 pr-4">{p.price}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.stock === 0
                          ? "bg-red-500/10 text-red-500"
                          : p.stock <= 10
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {p.stock === 0 ? "Out of stock" : `${p.stock} in stock`}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[p.status]}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        aria-label={`Edit ${p.name}`}
                        onClick={() => setModal({ mode: "edit", product: p })}
                        className="rounded-md p-1.5 text-muted transition-colors hover:bg-surface hover:text-foreground"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        aria-label={`Delete ${p.name}`}
                        onClick={() => handleDelete(p)}
                        className="rounded-md p-1.5 text-muted transition-colors hover:bg-red-500/10 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-muted">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddProductModal
        isOpen={modal?.mode === "add"}
        onClose={() => setModal(null)}
      />

      <AddProductModal
        isOpen={modal?.mode === "edit"}
        onClose={() => setModal(null)}
        heading="Edit product"
        submitText="Save changes"
        initial={modal?.mode === "edit" ? editInitial(modal.product) : undefined}
        onSave={(values) => {
          if (modal?.mode === "edit") handleEditSave(modal.product.id, values);
        }}
      />
    </div>
  );
}
