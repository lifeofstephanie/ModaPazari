"use client";

import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  AddProductModal,
  type ProductFormValues,
} from "../_components/addProductModal";
import { PageHeader } from "../_components/pageHeader";
import { vendorService, type ApiProduct } from "@/services/api";

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;
const cap = (s?: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : "Pending";

const statusStyle = (status?: string) => {
  switch (status) {
    case "approved":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    case "rejected":
      return "bg-red-500/10 text-red-500";
    default:
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
  }
};

type ModalState =
  | { mode: "add" }
  | { mode: "edit"; product: ApiProduct }
  | null;

export default function VendorProductsPage() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modal, setModal] = useState<ModalState>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await vendorService.getProducts();
      setProducts(data);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const rows = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (product: ApiProduct) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    try {
      await vendorService.deleteProduct(product._id);
      setProducts((list) => list.filter((p) => p._id !== product._id));
      toast.success(`"${product.name}" deleted`);
    } catch {
      /* interceptor toasts */
    }
  };

  const saveNew = async (values: ProductFormValues) => {
    await vendorService.createProduct({
      name: values.name,
      description: values.description,
      price: values.price,
      stock: values.stock,
    });
    toast.success("Product submitted for review");
    await load();
  };

  const saveEdit = (id: string) => async (values: ProductFormValues) => {
    await vendorService.updateProduct(id, {
      name: values.name,
      description: values.description,
      price: values.price,
      stock: values.stock,
    });
    toast.success("Product updated");
    await load();
  };

  const editInitial = (p: ApiProduct) => ({
    name: p.name,
    description: p.description,
    price: String(p.price),
    stock: String(p.stock),
    category: "",
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
          <p className="text-sm text-muted">
            {loading ? "Loading…" : `${rows.length} products`}
          </p>
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

        {error ? (
          <div className="py-16 text-center text-sm text-muted">
            Couldn&apos;t load products.{" "}
            <button onClick={load} className="text-accent hover:underline">
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="py-16 text-center text-sm text-muted">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-3 pr-4 font-medium">Product</th>
                  <th className="py-3 pr-4 font-medium">Price</th>
                  <th className="py-3 pr-4 font-medium">Stock</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 pr-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr
                    key={p._id}
                    className="border-b border-border/60 last:border-b-0 transition-colors hover:bg-surface"
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-md bg-accent-soft text-xs font-semibold text-accent">
                          {p.images?.[0] ? (
                            <img
                              src={p.images[0]}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            p.name.slice(0, 2).toUpperCase()
                          )}
                        </span>
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">{naira(p.price)}</td>
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
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle(p.status)}`}
                      >
                        {cap(p.status)}
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
                    <td
                      colSpan={5}
                      className="py-12 text-center text-sm text-muted"
                    >
                      No products yet. Add your first listing.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddProductModal
        isOpen={modal?.mode === "add"}
        onClose={() => setModal(null)}
        onSave={saveNew}
      />

      <AddProductModal
        isOpen={modal?.mode === "edit"}
        onClose={() => setModal(null)}
        heading="Edit product"
        submitText="Save changes"
        initial={modal?.mode === "edit" ? editInitial(modal.product) : undefined}
        onSave={modal?.mode === "edit" ? saveEdit(modal.product._id) : undefined}
      />
    </div>
  );
}
