"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import toast from "react-hot-toast";
import { authService } from "@/services/api";

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const email = params.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const invalidLink = !token || !email;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8)
      return toast.error("Password must be at least 8 characters");
    if (password !== confirm) return toast.error("Passwords don't match");
    try {
      setLoading(true);
      await authService.resetPassword({ email, token, password });
      toast.success("Password reset. Please sign in.");
      router.push("/login");
    } catch {
      /* interceptor toasts */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
        Moda Pazari
      </p>
      <h1 className="mt-3 text-2xl font-semibold">Reset password</h1>

      {invalidLink ? (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-red-500">
            This reset link is invalid or incomplete.
          </p>
          <Link
            href="/forgot-password"
            className="text-sm text-accent hover:underline"
          >
            Request a new link
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="h-11 rounded-lg border border-border bg-background px-3.5 text-sm outline-none focus:border-accent"
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm new password"
            className="h-11 rounded-lg border border-border bg-background px-3.5 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={loading}
            className="h-11 rounded-lg bg-accent-solid font-medium text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
          >
            {loading ? "Resetting…" : "Reset password"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <Suspense fallback={null}>
        <ResetForm />
      </Suspense>
    </div>
  );
}
