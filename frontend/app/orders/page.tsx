"use client";

import { ArrowLeft, Check, PackageOpen } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { orderService, type ApiOrder, type ApiOrderStatus } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

const STEPS: { key: ApiOrderStatus; label: string }[] = [
  { key: "pending", label: "Placed" },
  { key: "paid", label: "Paid" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

const stepIndex = (s: ApiOrderStatus) =>
  ({ pending: 0, paid: 1, shipped: 2, delivered: 3, cancelled: -1, refunded: -1 }[s]);

const fmtDate = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

export default function OrdersPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => setMounted(true), []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await orderService.getMine();
      setOrders(data);
    } catch {
      /* interceptor toasts */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    load();
  }, [mounted, user, router, load]);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-background px-5 pb-20 pt-28 md:px-10">
      <div className="mx-auto max-w-4xl">
        <button
          onClick={() => router.back()}
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Account
        </p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">My orders</h1>

        {loading ? (
          <p className="mt-10 text-sm text-muted">Loading…</p>
        ) : orders.length === 0 ? (
          <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border py-20 text-center">
            <PackageOpen size={40} className="text-muted" />
            <p className="text-lg font-medium">No orders yet</p>
            <Link
              href="/shop"
              className="rounded-full bg-accent-solid px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {orders.map((o) => (
              <OrderCard key={o._id} order={o} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

const OrderCard = ({ order }: { order: ApiOrder }) => {
  const current = stepIndex(order.status);
  const cancelled = order.status === "cancelled" || order.status === "refunded";

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <p className="font-semibold">#{order._id.slice(-6)}</p>
          <p className="text-xs text-muted">{fmtDate(order.createdAt)}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-accent">{naira(order.totalPrice)}</p>
          <p className="text-xs capitalize text-muted">{order.status}</p>
        </div>
      </div>

      {/* Tracker */}
      {cancelled ? (
        <p className="mt-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">
          This order was {order.status}.
        </p>
      ) : (
        <div className="mt-6 flex items-center">
          {STEPS.map((step, i) => {
            const done = i <= current;
            return (
              <div key={step.key} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center">
                  <span
                    className={`grid h-8 w-8 place-items-center rounded-full text-xs ${
                      done
                        ? "bg-accent-solid text-white"
                        : "border border-border bg-card text-muted"
                    }`}
                  >
                    {done ? <Check size={15} /> : i + 1}
                  </span>
                  <span
                    className={`mt-1.5 text-[11px] ${done ? "text-foreground" : "text-muted"}`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`mx-1 h-0.5 flex-1 ${i < current ? "bg-accent-solid" : "bg-border"}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Items */}
      <div className="mt-6 space-y-3 border-t border-border pt-4">
        {order.orderItems.map((item, i) => {
          const p = item.product;
          const img =
            p && typeof p === "object" && "images" in p
              ? (p as { images?: string[] }).images?.[0]
              : undefined;
          return (
            <div key={i} className="flex items-center gap-3">
              <img
                src={img || "/images/image.png"}
                alt=""
                className="h-14 w-14 rounded-lg object-cover"
              />
              <div className="flex-1">
                <p className="text-sm font-medium">{item.name || "Item"}</p>
                {(item.color || item.size) && (
                  <p className="text-xs text-muted">
                    {[item.color, item.size].filter(Boolean).join(" · ")}
                  </p>
                )}
                <p className="text-xs text-muted">{item.quantity}x</p>
              </div>
              <p className="text-sm">{naira(item.price * item.quantity)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
