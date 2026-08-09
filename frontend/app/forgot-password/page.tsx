"use client";

import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { authService } from "@/services/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return toast.error("Enter your email");
    try {
      setLoading(true);
      await authService.forgotPassword(email.trim());
      setSent(true);
    } catch {
      /* interceptor toasts */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Moda Pazari
        </p>
        <h1 className="mt-3 text-2xl font-semibold">Forgot password</h1>

        {sent ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-muted">
              If an account exists for <strong>{email}</strong>, we&apos;ve sent a
              reset link. Check your inbox (and spam).
            </p>
            <Link href="/login" className="text-sm text-accent hover:underline">
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-2 text-sm text-muted">
              Enter your email and we&apos;ll send you a reset link.
            </p>
            <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11 rounded-lg border border-border bg-background px-3.5 text-sm outline-none focus:border-accent"
              />
              <button
                type="submit"
                disabled={loading}
                className="h-11 rounded-lg bg-accent-solid font-medium text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>
              <Link
                href="/login"
                className="text-center text-sm text-muted hover:text-accent"
              >
                Back to sign in
              </Link>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
