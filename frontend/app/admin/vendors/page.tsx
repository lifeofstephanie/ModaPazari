"use client";

import { Check, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminService, type AdminUser } from "@/services/api";
import { Pager } from "../_components/pager";

type Filter = "pending" | "approved" | "rejected";
const FILTERS: Filter[] = ["pending", "approved", "rejected"];

const STATUS_STYLES: Record<string, string> = {
  approved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  rejected: "bg-red-500/10 text-red-500",
};

export default function AdminVendors() {
  const [filter, setFilter] = useState<Filter>("pending");
  const [vendors, setVendors] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const load = useCallback(async (f: Filter, p: number) => {
    try {
      setLoading(true);
      const { data } = await adminService.getVendors(f, p);
      setVendors(data.items);
      setPages(data.pages);
    } catch {
      /* interceptor toasts */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(filter, page);
  }, [filter, page, load]);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const moderate = async (v: AdminUser, status: "approved" | "rejected") => {
    try {
      setBusyId(v._id);
      await adminService.setVendorStatus(v._id, status);
      setVendors((list) => list.filter((x) => x._id !== v._id));
      toast.success(`Vendor ${status}`);
    } catch {
      /* interceptor toasts */
    } finally {
      setBusyId(null);
    }
  };

  const name = (v: AdminUser) =>
    v.storeName || [v.firstName, v.lastName].filter(Boolean).join(" ") || v.email;

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Onboarding
        </p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Vendors</h1>
      </div>

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
        ) : vendors.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted">
            No {filter} vendors.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-3 pr-4 font-medium">Vendor</th>
                  <th className="py-3 pr-4 font-medium">Email</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 pr-4 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((v) => (
                  <tr key={v._id} className="border-b border-border/60 last:border-b-0">
                    <td className="py-3 pr-4 font-medium">{name(v)}</td>
                    <td className="py-3 pr-4 text-muted">{v.email}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                          STATUS_STYLES[v.vendorStatus ?? "pending"]
                        }`}
                      >
                        {v.vendorStatus ?? "pending"}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center justify-end gap-2">
                        {v.vendorStatus !== "approved" && (
                          <button
                            disabled={busyId === v._id}
                            onClick={() => moderate(v, "approved")}
                            className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                          >
                            <Check size={14} /> Approve
                          </button>
                        )}
                        {v.vendorStatus !== "rejected" && (
                          <button
                            disabled={busyId === v._id}
                            onClick={() => moderate(v, "rejected")}
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
        <Pager page={page} pages={pages} onPage={setPage} />
      </div>
    </div>
  );
}
