"use client";

import {
  AlertTriangle,
  Banknote,
  Bell,
  LogOut,
  Settings,
  ShoppingBag,
  User,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";

type Notification = {
  id: number;
  icon: LucideIcon;
  tone: "accent" | "amber" | "emerald";
  title: string;
  detail: string;
  time: string;
  unread: boolean;
};

const TONES: Record<Notification["tone"], string> = {
  accent: "bg-accent-soft text-accent",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    icon: ShoppingBag,
    tone: "accent",
    title: "New order #2451",
    detail: "Annette Black · ₦74,500",
    time: "5m ago",
    unread: true,
  },
  {
    id: 2,
    icon: AlertTriangle,
    tone: "amber",
    title: "Low stock",
    detail: "“Silk Wrap Midi Dress” — 4 left",
    time: "1h ago",
    unread: true,
  },
  {
    id: 3,
    icon: Banknote,
    tone: "emerald",
    title: "Payout processed",
    detail: "₦120,000 credited to your account",
    time: "2h ago",
    unread: false,
  },
];

export const Navbar = () => {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState<null | "bell" | "profile">(null);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const markAllRead = () =>
    setNotifications((list) => list.map((n) => ({ ...n, unread: false })));

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    router.push("/login");
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b pt-[env(safe-area-inset-top,0px)] transition-colors ${
        scrolled
          ? "border-border bg-card/85 backdrop-blur-md"
          : "border-transparent bg-surface"
      }`}
    >
      {/* Click-away layer */}
      {menu && (
        <button
          aria-hidden
          tabIndex={-1}
          className="fixed inset-0 z-40 cursor-default"
          onClick={() => setMenu(null)}
        />
      )}

      <div className="relative flex h-16 items-center justify-between px-5 md:px-8">
        {/* Brand + greeting */}
        <div className="flex items-center gap-3 pl-12 md:pl-0">
          <span className="font-[MomoSignature] text-2xl leading-none text-accent">
            Moda Pazari
          </span>
          <span className="hidden h-5 w-px bg-border md:block" />
          <p className="hidden text-sm text-muted md:block">
            Good morning,{" "}
            <span className="font-medium text-foreground">Stephanie</span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications */}
          <div className="relative z-50">
            <button
              aria-label="Notifications"
              onClick={() => setMenu((m) => (m === "bell" ? null : "bell"))}
              className="relative rounded-md border border-border bg-background p-2 text-foreground transition-colors hover:bg-surface"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent-solid px-1 text-[10px] font-semibold leading-none text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {menu === "bell" && (
              <div className="absolute right-0 mt-2 w-[19rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-card shadow-xl">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">Notifications</p>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-accent-soft px-1.5 py-0.5 text-[10px] font-semibold text-accent">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <button
                    onClick={markAllRead}
                    className="text-xs font-medium text-accent transition-colors hover:text-accent-strong"
                  >
                    Mark all read
                  </button>
                </div>

                <ul className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => {
                    const Icon = n.icon;
                    return (
                      <li key={n.id}>
                        <button
                          onClick={() =>
                            setNotifications((list) =>
                              list.map((x) =>
                                x.id === n.id ? { ...x, unread: false } : x
                              )
                            )
                          }
                          className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface ${
                            n.unread ? "bg-accent-soft/40" : ""
                          }`}
                        >
                          <span
                            className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full ${TONES[n.tone]}`}
                          >
                            <Icon size={16} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                              <span className="truncate text-sm font-medium">
                                {n.title}
                              </span>
                              {n.unread && (
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-solid" />
                              )}
                            </span>
                            <span className="mt-0.5 block truncate text-xs text-muted">
                              {n.detail}
                            </span>
                            <span className="mt-0.5 block text-[11px] text-muted">
                              {n.time}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>

                <Link
                  href="/vendor/orders/pending"
                  onClick={() => setMenu(null)}
                  className="block border-t border-border px-4 py-3 text-center text-sm font-medium text-accent transition-colors hover:bg-surface"
                >
                  View all activity
                </Link>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative z-50">
            <button
              onClick={() => setMenu((m) => (m === "profile" ? null : "profile"))}
              className="flex items-center gap-2.5 rounded-md p-1 transition-colors hover:bg-surface"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
                AS
              </span>
              <div className="hidden text-left leading-tight md:block">
                <p className="text-sm font-medium">Anyanwu Stephanie</p>
                <p className="text-xs text-muted">Vendor</p>
              </div>
            </button>

            {menu === "profile" && (
              <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-xl">
                <Link
                  href="/vendor/settings"
                  onClick={() => setMenu(null)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-surface"
                >
                  <User size={16} className="text-muted" />
                  Profile
                </Link>
                <Link
                  href="/vendor/settings"
                  onClick={() => setMenu(null)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-surface"
                >
                  <Settings size={16} className="text-muted" />
                  Settings
                </Link>
                <div className="my-1 h-px bg-border" />
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-500/10"
                >
                  <LogOut size={16} />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
