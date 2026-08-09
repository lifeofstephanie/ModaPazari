"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { authService } from "@/services/api";

function VerifyInner() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const email = params.get("email") ?? "";
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (!token || !email) {
      setState("error");
      return;
    }
    authService
      .verifyEmail({ email, token })
      .then(() => setState("ok"))
      .catch(() => setState("error"));
  }, [token, email]);

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
        Moda Pazari
      </p>
      {state === "loading" && (
        <p className="mt-6 text-sm text-muted">Verifying your email…</p>
      )}
      {state === "ok" && (
        <>
          <h1 className="mt-4 text-2xl font-semibold">Email verified ✓</h1>
          <p className="mt-2 text-sm text-muted">Your account is confirmed.</p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-lg bg-accent-solid px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-strong"
          >
            Continue to sign in
          </Link>
        </>
      )}
      {state === "error" && (
        <>
          <h1 className="mt-4 text-2xl font-semibold">Verification failed</h1>
          <p className="mt-2 text-sm text-muted">
            This link is invalid or has expired.
          </p>
          <Link href="/login" className="mt-6 inline-block text-sm text-accent hover:underline">
            Back to sign in
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <Suspense fallback={null}>
        <VerifyInner />
      </Suspense>
    </div>
  );
}
