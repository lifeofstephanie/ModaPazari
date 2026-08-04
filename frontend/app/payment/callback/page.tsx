"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { paymentService } from "@/services/api";
import { useCartStore } from "@/store/useCartStore";

type Status = "loading" | "success" | "failed";

export default function PaymentCallback() {
  const clearCart = useCartStore((s) => s.clearCart);
  const [status, setStatus] = useState<Status>("loading");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference") || params.get("trxref");

    if (!reference) {
      setStatus("failed");
      return;
    }

    (async () => {
      try {
        const { data } = await paymentService.verify(reference);
        if (data?.data?.status === "success") {
          clearCart();
          setStatus("success");
        } else {
          setStatus("failed");
        }
      } catch {
        setStatus("failed");
      }
    })();
  }, [clearCart]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-5 pt-28">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center">
        {status === "loading" && (
          <>
            <Loader2 size={40} className="mx-auto animate-spin text-accent" />
            <h1 className="mt-5 text-xl font-semibold">Confirming payment…</h1>
            <p className="mt-2 text-sm text-muted">
              Hold on while we verify your transaction.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2
              size={44}
              className="mx-auto text-emerald-600 dark:text-emerald-400"
            />
            <h1 className="mt-5 text-xl font-semibold">Payment successful</h1>
            <p className="mt-2 text-sm text-muted">
              Thank you! Your order has been confirmed and is now being
              processed.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-block rounded-md bg-accent-solid px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
            >
              Continue shopping
            </Link>
          </>
        )}

        {status === "failed" && (
          <>
            <XCircle size={44} className="mx-auto text-red-500" />
            <h1 className="mt-5 text-xl font-semibold">
              We couldn&apos;t confirm your payment
            </h1>
            <p className="mt-2 text-sm text-muted">
              If you were charged, your order will still be confirmed shortly —
              our system reconciles payments automatically. Otherwise, please
              try again.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/checkout"
                className="rounded-md border border-border px-5 py-2.5 text-sm transition-colors hover:bg-surface"
              >
                Back to checkout
              </Link>
              <Link
                href="/shop"
                className="rounded-md bg-accent-solid px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
              >
                Continue shopping
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
