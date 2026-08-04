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

  return <>{children}</>;
}
