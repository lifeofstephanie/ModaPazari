"use client";

import {
  Bell,
  Package,
  ShoppingBag,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { notificationService, type ApiNotification } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";

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

/** Self-contained notification bell for the storefront header. Renders nothing
 * until mounted / signed in (avoids SSR hydration mismatch on auth state). */
export const NotificationBell = () => {
  const user = useAuthStore((s) => s.user);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);

  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => setMounted(true), []);

  const load = useCallback(async () => {
    try {
      const { data } = await notificationService.list();
      setNotifications(data);
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    if (!mounted || !user) return;
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [mounted, user, load]);

  if (!mounted || !user) return null;

  const markAll = async () => {
    setNotifications((list) => list.map((n) => ({ ...n, read: true })));
    try {
      await notificationService.markAllRead();
    } catch {
      load();
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
      /* optimistic */
    }
  };

  return (
    <div className="relative">
      {open && (
        <button
          aria-hidden
          tabIndex={-1}
          className="fixed inset-0 z-40 cursor-default"
          onClick={() => setOpen(false)}
        />
      )}

      <button
        aria-label="Notifications"
        onClick={() => setOpen((o) => !o)}
        className="relative grid h-9 w-9 place-items-center rounded-full border border-border text-foreground transition-colors hover:border-accent hover:text-accent"
      >
        <Bell size={17} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent-solid px-1 text-[10px] font-semibold leading-none text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[19rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-card text-left shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            {unread > 0 && (
              <button
                onClick={markAll}
                className="text-xs font-medium text-accent hover:text-accent-strong"
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
                        className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${meta.tone}`}
                      >
                        <Icon size={15} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm leading-snug text-foreground">
                          {n.message}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-muted">
                          {timeAgo(n.createdAt)}
                        </span>
                      </span>
                      {!n.read && (
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-solid" />
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
