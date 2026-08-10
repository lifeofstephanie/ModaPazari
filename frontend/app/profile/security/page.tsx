"use client";

import { Lock } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { authService } from "@/services/api";

export default function SecurityPage() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next.length < 8) return toast.error("New password must be at least 8 characters");
    if (next !== confirm) return toast.error("New passwords don't match");
    try {
      setSaving(true);
      await authService.changePassword({
        currentPassword: current,
        newPassword: next,
      });
      setCurrent("");
      setNext("");
      setConfirm("");
      toast.success("Password updated");
    } catch {
      /* interceptor toasts */
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="max-w-lg rounded-2xl border border-border bg-card p-6">
      <div className="mb-1 flex items-center gap-2">
        <Lock size={18} className="text-accent" />
        <h2 className="text-base font-semibold">Change password</h2>
      </div>
      <p className="mb-5 text-sm text-muted">
        Use a strong password you don&apos;t use elsewhere.
      </p>

      <form onSubmit={submit} className="space-y-4">
        <Field label="Current password">
          <input
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className="p-input"
            autoComplete="current-password"
          />
        </Field>
        <Field label="New password">
          <input
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            className="p-input"
            autoComplete="new-password"
          />
        </Field>
        <Field label="Confirm new password">
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="p-input"
            autoComplete="new-password"
          />
        </Field>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-accent-solid px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
        >
          {saving ? "Updating…" : "Update password"}
        </button>
      </form>

      <style jsx global>{`
        .p-input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid var(--border);
          background: var(--background);
          padding: 0.55rem 0.75rem;
          font-size: 0.875rem;
          color: var(--foreground);
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .p-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--ring);
        }
      `}</style>
    </section>
  );
}

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-sm font-medium">{label}</span>
    {children}
  </label>
);
