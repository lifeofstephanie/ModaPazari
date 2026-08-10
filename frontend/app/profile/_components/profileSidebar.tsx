"use client";

import { Heart, Lock, LogOut, Package, User2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";

const items = [
  { href: "/profile", label: "General", icon: User2, exact: true },
  { href: "/profile/security", label: "Security", icon: Lock },
  { href: "/profile/orders", label: "Orders", icon: Package },
  { href: "/profile/wishlist", label: "Wishlist", icon: Heart },
];

export function ProfileSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-card p-2 md:flex-col md:overflow-visible">
      {items.map((it) => {
        const Icon = it.icon;
        const on = isActive(it.href, it.exact);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm transition-colors ${
              on
                ? "bg-accent-soft font-medium text-accent"
                : "text-muted hover:bg-surface hover:text-foreground"
            }`}
          >
            <Icon size={17} />
            {it.label}
          </Link>
        );
      })}
      <button
        onClick={() => {
          logout();
          toast.success("Logged out");
          router.push("/login");
        }}
        className="flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-500/10 md:mt-1"
      >
        <LogOut size={17} />
        Log out
      </button>
    </nav>
  );
}
