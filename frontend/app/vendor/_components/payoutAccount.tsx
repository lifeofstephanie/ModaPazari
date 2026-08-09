"use client";

import { BadgeCheck, Landmark } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { vendorService } from "@/services/api";

export const PayoutAccount = () => {
  const [banks, setBanks] = useState<{ name: string; code: string }[]>([]);
  const [connected, setConnected] = useState(false);
  const [existing, setExisting] = useState<{ bankName?: string; accountNumber?: string }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  useEffect(() => {
    Promise.all([
      vendorService.getPayoutAccount().then(({ data }) => {
        setConnected(data.connected);
        setExisting({ bankName: data.bankName, accountNumber: data.accountNumber });
      }),
      vendorService.getBanks().then(({ data }) => setBanks(data)),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const bank = banks.find((b) => b.code === bankCode);
    if (!bank) return toast.error("Select your bank");
    if (accountNumber.trim().length < 10)
      return toast.error("Enter a valid 10-digit account number");
    try {
      setSaving(true);
      await vendorService.setupPayoutAccount({
        bankName: bank.name,
        bankCode: bank.code,
        accountNumber: accountNumber.trim(),
      });
      setConnected(true);
      setExisting({ bankName: bank.name, accountNumber: accountNumber.trim() });
      toast.success("Payout account connected");
    } catch {
      /* interceptor toasts */
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <Landmark size={18} className="text-accent" />
        <h2 className="text-base font-semibold">Payout account</h2>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : connected ? (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
          <BadgeCheck size={20} className="text-emerald-600 dark:text-emerald-400" />
          <div className="text-sm">
            <p className="font-medium">Connected</p>
            <p className="text-muted">
              {existing.bankName} ·••• {existing.accountNumber?.slice(-4)}
            </p>
          </div>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-muted">
            Connect your bank so payments for your sales are settled to you
            automatically (minus platform commission).
          </p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Bank</label>
              <select
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
              >
                <option value="">Select bank</option>
                {banks.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Account number
              </label>
              <input
                value={accountNumber}
                onChange={(e) =>
                  setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                inputMode="numeric"
                placeholder="0123456789"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-accent-solid px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
            >
              {saving ? "Connecting…" : "Connect account"}
            </button>
          </form>
        </>
      )}
    </div>
  );
};
