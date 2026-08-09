"use client";

import { Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminService, type ApiPromo } from "@/services/api";

const emptyForm = {
  code: "",
  discountType: "percentage" as "percentage" | "fixed",
  discountValue: "",
  maxUses: "",
  expiresAt: "",
};

export default function AdminPromos() {
  const [promos, setPromos] = useState<ApiPromo[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await adminService.getPromos();
      setPromos(data);
    } catch {
      /* interceptor toasts */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const discountValue = Number(form.discountValue);
    const maxUses = Number(form.maxUses);
    if (!form.code.trim()) return toast.error("Enter a code");
    if (!Number.isFinite(discountValue) || discountValue < 0)
      return toast.error("Enter a valid discount value");
    if (!Number.isInteger(maxUses) || maxUses < 0)
      return toast.error("Enter a valid max uses");
    try {
      setSaving(true);
      const { data } = await adminService.createPromo({
        code: form.code.trim().toUpperCase(),
        discountType: form.discountType,
        discountValue,
        maxUses,
        expiresAt: form.expiresAt || undefined,
      });
      setPromos((p) => [data, ...p]);
      setForm(emptyForm);
      toast.success("Promo created");
    } catch {
      /* interceptor toasts */
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (promo: ApiPromo) => {
    setPromos((list) =>
      list.map((p) => (p._id === promo._id ? { ...p, active: !p.active } : p))
    );
    try {
      await adminService.updatePromo(promo._id, { active: !promo.active });
    } catch {
      load();
    }
  };

  const remove = async (promo: ApiPromo) => {
    if (!window.confirm(`Delete ${promo.code}?`)) return;
    setPromos((list) => list.filter((p) => p._id !== promo._id));
    try {
      await adminService.deletePromo(promo._id);
      toast.success("Promo deleted");
    } catch {
      load();
    }
  };

  const setF = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Marketing
        </p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Promo codes</h1>
      </div>

      {/* Create */}
      <form
        onSubmit={create}
        className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-border bg-card p-5 sm:grid-cols-2 lg:grid-cols-6"
      >
        <input
          value={form.code}
          onChange={(e) => setF("code", e.target.value.toUpperCase())}
          placeholder="CODE"
          className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent lg:col-span-2"
        />
        <select
          value={form.discountType}
          onChange={(e) => setF("discountType", e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="percentage">% off</option>
          <option value="fixed">₦ off</option>
        </select>
        <input
          value={form.discountValue}
          onChange={(e) => setF("discountValue", e.target.value)}
          type="number"
          min={0}
          placeholder={form.discountType === "percentage" ? "e.g. 10" : "e.g. 2000"}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <input
          value={form.maxUses}
          onChange={(e) => setF("maxUses", e.target.value)}
          type="number"
          min={0}
          placeholder="Max uses"
          className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-accent-solid px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
        >
          <Plus size={16} /> Add
        </button>
      </form>

      <div className="rounded-xl border border-border bg-card p-6">
        {loading ? (
          <div className="py-16 text-center text-sm text-muted">Loading…</div>
        ) : promos.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted">No promo codes yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-3 pr-4 font-medium">Code</th>
                  <th className="py-3 pr-4 font-medium">Discount</th>
                  <th className="py-3 pr-4 font-medium">Uses</th>
                  <th className="py-3 pr-4 font-medium">Active</th>
                  <th className="py-3 pr-4 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {promos.map((p) => (
                  <tr key={p._id} className="border-b border-border/60 last:border-b-0">
                    <td className="py-3 pr-4 font-medium">{p.code}</td>
                    <td className="py-3 pr-4">
                      {p.discountType === "percentage"
                        ? `${p.discountValue}%`
                        : `₦${p.discountValue.toLocaleString("en-NG")}`}
                    </td>
                    <td className="py-3 pr-4 text-muted">
                      {p.usedCount}/{p.maxUses}
                    </td>
                    <td className="py-3 pr-4">
                      <button
                        onClick={() => toggle(p)}
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.active
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-muted/20 text-muted"
                        }`}
                      >
                        {p.active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <button
                        onClick={() => remove(p)}
                        aria-label={`Delete ${p.code}`}
                        className="rounded-md p-1.5 text-muted transition-colors hover:bg-red-500/10 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
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
