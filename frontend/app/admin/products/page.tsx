"use client";

import { Check, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminService, type ApiProduct } from "@/services/api";

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;
type Filter = "pending" | "approved" | "rejected";
const FILTERS: Filter[] = ["pending", "approved", "rejected"];

const vendorLabel = (v: ApiProduct["vendor"]) => {
  if (!v || typeof v === "string") return "—";
  const a = v as { storeName?: string; firstName?: string; lastName?: string; email?: string };
  return (
    a.storeName ||
    [a.firstName, a.lastName].filter(Boolean).join(" ") ||
    a.email ||
    "—"
  );
};

export default function AdminProducts() {
  const [filter, setFilter] = useState<Filter>("pending");
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (f: Filter) => {
    try {
      setLoading(true);
      const { data } = await adminService.getProducts(f);
      setProducts(data);
    } catch {
      /* interceptor toasts */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(filter);
  }, [filter, load]);

  const moderate = async (p: ApiProduct, status: "approved" | "rejected") => {
    try {
      setBusyId(p._id);
      await adminService.setProductStatus(p._id, status);
      setProducts((list) => list.filter((x) => x._id !== p._id));
      toast.success(`"${p.name}" ${status}`);
    } catch {
      /* interceptor toasts */
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Moderation
        </p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Products</h1>
      </div>

      {/* Filter tabs */}
      <div className="mb-5 inline-flex rounded-md border border-border bg-card p-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded px-4 py-1.5 text-sm capitalize transition-colors ${
              filter === f
                ? "bg-accent-solid text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        {loading ? (
          <div className="py-16 text-center text-sm text-muted">Loading…</div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted">
            No {filter} products.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-3 pr-4 font-medium">Product</th>
                  <th className="py-3 pr-4 font-medium">Vendor</th>
                  <th className="py-3 pr-4 font-medium">Price</th>
                  <th className="py-3 pr-4 font-medium">Stock</th>
                  <th className="py-3 pr-4 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr
                    key={p._id}
                    className="border-b border-border/60 last:border-b-0"
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-md bg-accent-soft text-xs font-semibold text-accent">
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
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="max-w-xs truncate text-xs text-muted">
                            {p.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-muted">{vendorLabel(p.vendor)}</td>
                    <td className="py-3 pr-4">{naira(p.price)}</td>
                    <td className="py-3 pr-4">{p.stock}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center justify-end gap-2">
                        {p.status !== "approved" && (
                          <button
                            disabled={busyId === p._id}
                            onClick={() => moderate(p, "approved")}
                            className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                          >
                            <Check size={14} /> Approve
                          </button>
                        )}
                        {p.status !== "rejected" && (
                          <button
                            disabled={busyId === p._id}
                            onClick={() => moderate(p, "rejected")}
                            className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                          >
                            <X size={14} /> Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
