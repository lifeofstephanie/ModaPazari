"use client";

import {
  Bell,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  Tag,
  User,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { notificationService, type ApiNotification } from "@/services/api";

const TYPE_META: Record<
  ApiNotification["type"],
  { icon: LucideIcon; tone: string }
> = {
  order: { icon: ShoppingBag, tone: "bg-accent-soft text-accent" },
  promo: { icon: Tag, tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  system: { icon: Package, tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
};

const timeAgo = (iso?: string) => {
  if (!iso) return "";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export const Navbar = () => {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState<null | "bell" | "profile">(null);
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const loadNotifications = useCallback(async () => {
    try {
      const { data } = await notificationService.list();
      setNotifications(data);
    } catch {
      /* silent — bell just stays empty */
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Poll for new notifications every 30s (no realtime infra needed).
  useEffect(() => {
    loadNotifications();
    const id = setInterval(loadNotifications, 30000);
    return () => clearInterval(id);
  }, [loadNotifications]);

  const markAllRead = async () => {
    setNotifications((list) => list.map((n) => ({ ...n, read: true })));
    try {
      await notificationService.markAllRead();
    } catch {
      loadNotifications();
    }
  };

  const openOne = async (n: ApiNotification) => {
    if (n.read) return;
    setNotifications((list) =>
      list.map((x) => (x._id === n._id ? { ...x, read: true } : x))
    );
    try {
      await notificationService.markRead(n._id);
    } catch {
      /* optimistic; refetch on next poll */
    }
  };

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
      {menu && (
        <button
          aria-hidden
          tabIndex={-1}
          className="fixed inset-0 z-40 cursor-default"
          onClick={() => setMenu(null)}
        />
      )}

      <div className="relative flex h-16 items-center justify-between px-5 md:px-8">
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
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs font-medium text-accent transition-colors hover:text-accent-strong"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <ul className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <li className="px-4 py-8 text-center text-sm text-muted">
                      No notifications yet.
                    </li>
                  ) : (
                    notifications.map((n) => {
                      const meta = TYPE_META[n.type] ?? TYPE_META.system;
                      const Icon = meta.icon;
                      return (
                        <li key={n._id}>
                          <button
                            onClick={() => openOne(n)}
                            className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface ${
                              !n.read ? "bg-accent-soft/40" : ""
                            }`}
                          >
                            <span
                              className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full ${meta.tone}`}
                            >
                              <Icon size={16} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex items-center gap-2">
                                <span className="flex-1 text-sm leading-snug">
                                  {n.message}
                                </span>
                                {!n.read && (
                                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-solid" />
                                )}
                              </span>
                              <span className="mt-0.5 block text-[11px] text-muted">
                                {timeAgo(n.createdAt)}
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })
                  )}
                </ul>
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
