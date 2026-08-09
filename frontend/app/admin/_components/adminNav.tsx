"use client";

import { LayoutDashboard, LogOut, Package, ShoppingBag, Store, Tag, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";

const tabs = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Vendors", href: "/admin/vendors", icon: Store },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Promos", href: "/admin/promos", icon: Tag },
];

export const AdminNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <span className="font-[MomoSignature] text-2xl leading-none text-accent">
          Moda Pazari
        </span>
        <span className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-muted sm:block">
          Admin
        </span>
        <button
          onClick={() => {
            logout();
            toast.success("Logged out");
            router.push("/login");
          }}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:bg-surface"
        >
          <LogOut size={15} />
          Log out
        </button>
      </div>

      <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = isActive(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`flex items-center gap-2 border-b-2 px-3 py-3 text-sm transition-colors ${
                active
                  ? "border-accent font-medium text-accent"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              <Icon size={16} />
              {t.name}
            </Link>
          );
        })}
      </nav>
    </header>
  );
};
