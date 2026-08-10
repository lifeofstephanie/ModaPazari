"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { ProfileSidebar } from "./profileSidebar";

/** Auth-guarded account shell: header (from layout) + sidebar + section content. */
export function ProfileShell({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (mounted && !user) router.replace("/login");
  }, [mounted, user, router]);

  if (!mounted || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted">
        Loading…
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-surface px-5 pb-20 pt-24 md:px-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight sm:text-3xl">
          My account
        </h1>
        <div className="flex flex-col gap-6 md:flex-row">
          <aside className="md:w-56 md:shrink-0">
            <ProfileSidebar />
          </aside>
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </main>
  );
}
