"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";

/** Admin-only guard. Sends unauthenticated users to /login, non-admins home. */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    if (!user) router.replace("/login");
    else if (user.role !== "admin") router.replace("/");
  }, [mounted, user, router]);

  if (!mounted || !user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-sm text-muted">
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}
