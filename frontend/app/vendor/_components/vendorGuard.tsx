"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Client-side guard for the vendor area. Redirects unauthenticated users to
 * /login and non-vendors to the storefront. Renders nothing until mounted to
 * avoid an SSR/client hydration mismatch (auth state lives in localStorage).
 */
export function VendorGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    if (!user) {
      router.replace("/login");
    } else if (user.role && user.role !== "vendor") {
      router.replace("/");
    }
  }, [mounted, user, router]);

  const allowed = mounted && user && (!user.role || user.role === "vendor");

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-sm text-muted">
        Loading…
      </div>
    );
  }

  const pending = user?.vendorStatus === "pending" || !user?.vendorStatus;
  const rejected = user?.vendorStatus === "rejected";

  return (
    <>
      {(pending || rejected) && (
        <div
          className={`fixed inset-x-0 top-[calc(4rem+env(safe-area-inset-top,0px))] z-30 px-4 py-2.5 text-center text-sm ${
            rejected
              ? "bg-red-500/10 text-red-500"
              : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
          }`}
        >
          {rejected
            ? "Your vendor application was not approved. Contact support for details."
            : "Your vendor account is pending approval — you can explore the dashboard, but product listing is disabled until an admin approves you."}
        </div>
      )}
      {children}
    </>
  );
}
