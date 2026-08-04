"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Menu,
  Home,
  Package,
  ShoppingCart,
  BarChart,
  Settings,
  Clock,
  CheckCircle,
  HelpCircle,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type SubItem = { name: string; path: string; icon: LucideIcon };
type MenuItem = {
  name: string;
  icon: LucideIcon;
  path?: string;
  subItems?: SubItem[];
};

const menuItems: MenuItem[] = [
  { name: "Dashboard", path: "/vendor", icon: Home },
  {
    name: "Orders",
    icon: ShoppingCart,
    subItems: [
      { name: "Pending", path: "/vendor/orders/pending", icon: Clock },
      { name: "Completed", path: "/vendor/orders/completed", icon: CheckCircle },
    ],
  },
  { name: "Products", path: "/vendor/products", icon: Package },
  { name: "Analytics", path: "/vendor/analytics", icon: BarChart },
  { name: "Settings", path: "/vendor/settings", icon: Settings },
  { name: "Help Center", path: "/vendor/helpCenter", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(
    pathname.startsWith("/vendor/orders")
  );

  const isActive = (path: string) =>
    path === "/vendor" ? pathname === "/vendor" : pathname.startsWith(path);

  const linkClass = (active: boolean) =>
    `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
      active
        ? "bg-accent-soft font-medium text-accent"
        : "text-muted hover:bg-surface hover:text-foreground"
    }`;

  return (
    <>
      {/* Mobile toggle */}
      <button
        aria-label="Toggle menu"
        className="fixed left-4 top-[calc(0.875rem+env(safe-area-inset-top,0px))] z-[60] rounded-md border border-border bg-card p-2 md:hidden"
        onClick={() => setMobileOpen((v) => !v)}
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-[calc(4rem+env(safe-area-inset-top,0px))] z-50 w-64 shrink-0 overflow-y-auto
          h-[calc(100vh-4rem-env(safe-area-inset-top,0px))]
          border-r border-border bg-card p-4
          transition-transform duration-300
          ${mobileOpen ? "left-0 translate-x-0" : "-translate-x-full md:translate-x-0"}
          md:left-0 md:block
        `}
      >
        <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          Menu
        </p>

        <nav>
          <ul className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              if (item.subItems) {
                const groupActive = pathname.startsWith("/vendor/orders");
                return (
                  <li key={item.name}>
                    <button
                      onClick={() => setOrdersOpen((v) => !v)}
                      className={`w-full justify-between ${linkClass(groupActive && !ordersOpen)}`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon size={18} />
                        {item.name}
                      </span>
                      {ordersOpen ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>

                    {ordersOpen && (
                      <ul className="mt-1 flex flex-col gap-1 pl-4">
                        {item.subItems.map((sub) => {
                          const SubIcon = sub.icon;
                          return (
                            <li key={sub.name}>
                              <Link
                                href={sub.path}
                                onClick={() => setMobileOpen(false)}
                                className={linkClass(isActive(sub.path))}
                              >
                                <SubIcon size={16} />
                                {sub.name}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              }

              return (
                <li key={item.name}>
                  <Link
                    href={item.path!}
                    onClick={() => setMobileOpen(false)}
                    className={linkClass(isActive(item.path!))}
                  >
                    <Icon size={18} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
