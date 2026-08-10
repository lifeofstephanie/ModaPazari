"use client";

import {
  Check,
  ChevronRight,
  MapPin,
  PackageCheck,
  PackageOpen,
  ShoppingBag,
  Truck,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { orderService, type ApiOrder, type ApiOrderStatus } from "@/services/api";

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;
const FALLBACK = "/images/image.png";

const STATUS_STYLES: Record<ApiOrderStatus, string> = {
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  paid: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  shipped: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  delivered: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  cancelled: "bg-red-500/10 text-red-500",
  refunded: "bg-foreground/10 text-muted",
};

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

const itemImage = (item: ApiOrder["orderItems"][number]) => {
  const p = item.product;
  if (p && typeof p === "object" && "images" in p) {
    return (p as { images?: string[] }).images?.[0] || FALLBACK;
  }
  return FALLBACK;
};

const variantLabel = (item: ApiOrder["orderItems"][number]) =>
  [item.color, item.size].filter(Boolean).join(" · ");

export default function ProfileOrdersPage() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<ApiOrder | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "delivered" | "past">(
    "all"
  );

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
    load();
  }, [load]);

  const inProgress = orders.filter((o) =>
    ["pending", "paid", "shipped"].includes(o.status)
  ).length;
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;
  const totalSpent = orders
    .filter((o) => ["paid", "shipped", "delivered"].includes(o.status))
    .reduce((s, o) => s + o.totalPrice, 0);

  const TABS: { key: typeof filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "In progress" },
    { key: "delivered", label: "Delivered" },
    { key: "past", label: "Cancelled" },
  ];

  const filtered = orders.filter((o) =>
    filter === "all"
      ? true
      : filter === "active"
        ? ["pending", "paid", "shipped"].includes(o.status)
        : filter === "delivered"
          ? o.status === "delivered"
          : ["cancelled", "refunded"].includes(o.status)
  );

  return (
    <div>
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl border border-border bg-card"
            />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border py-20 text-center">
          <PackageOpen size={40} className="text-muted" />
          <p className="text-lg font-medium">No orders yet</p>
          <p className="max-w-xs text-sm text-muted">
            When you place an order it&apos;ll show up here with live tracking.
          </p>
          <Link
            href="/shop"
            className="rounded-full bg-accent-solid px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <>
          {/* Summary tiles */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Orders" value={String(orders.length)} icon={ShoppingBag} />
            <Stat label="In progress" value={String(inProgress)} icon={Truck} />
            <Stat label="Delivered" value={String(deliveredCount)} icon={PackageCheck} />
            <Stat label="Total spent" value={naira(totalSpent)} icon={Wallet} />
          </div>

          {/* Filter tabs */}
          <div className="mt-6 flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  filter === t.key
                    ? "border-accent bg-accent-solid text-white"
                    : "border-border text-muted hover:border-accent hover:text-accent"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Order cards */}
          {filtered.length === 0 ? (
            <p className="mt-8 rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted">
              No {filter === "past" ? "cancelled" : filter} orders.
            </p>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {filtered.map((o) => {
                const count = o.orderItems.reduce((n, i) => n + i.quantity, 0);
                const names = o.orderItems
                  .map((i) => i.name)
                  .filter(Boolean)
                  .slice(0, 2)
                  .join(", ");
                return (
                  <button
                    key={o._id}
                    onClick={() => setActive(o)}
                    className="group flex flex-col rounded-2xl border border-border bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">
                        #{o._id.slice(-6)}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${STATUS_STYLES[o.status]}`}
                      >
                        {o.status}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex -space-x-3">
                        {o.orderItems.slice(0, 3).map((it, i) => (
                          <img
                            key={i}
                            src={itemImage(it)}
                            alt=""
                            className="h-14 w-14 rounded-lg border-2 border-card object-cover"
                          />
                        ))}
                        {o.orderItems.length > 3 && (
                          <span className="grid h-14 w-14 place-items-center rounded-lg border-2 border-card bg-surface-2 text-xs font-medium text-muted">
                            +{o.orderItems.length - 3}
                          </span>
                        )}
                      </div>
                      <p className="min-w-0 flex-1 truncate text-sm text-muted">
                        {names || `${count} item${count === 1 ? "" : "s"}`}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                      <span className="text-xs text-muted">
                        {fmtDate(o.createdAt)} · {count} item
                        {count === 1 ? "" : "s"}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-accent">
                        {naira(o.totalPrice)}
                        <ChevronRight
                          size={16}
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      {active && (
        <OrderDetailModal order={active} onClose={() => setActive(null)} />
      )}
    </div>
  );
}

const Stat = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) => (
  <div className="rounded-2xl border border-border bg-card p-4">
    <span className="grid h-8 w-8 place-items-center rounded-md bg-accent-soft text-accent">
      <Icon size={16} />
    </span>
    <p className="mt-3 text-lg font-semibold tracking-tight">{value}</p>
    <p className="text-xs text-muted">{label}</p>
  </div>
);

const OrderDetailModal = ({
  order,
  onClose,
}: {
  order: ApiOrder;
  onClose: () => void;
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const current = stepIndex(order.status);
  const terminal = order.status === "cancelled" || order.status === "refunded";
  const addr = order.shippingAddress;
  const subtotal =
    order.subtotal ??
    order.orderItems.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div className="fixed inset-0 z-[80] flex justify-center overflow-y-auto p-4 sm:items-center">
      <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} aria-hidden />

      <div className="relative my-auto w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Order</p>
            <p className="font-semibold">#{order._id.slice(-6)}</p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[order.status]}`}
            >
              {order.status}
            </span>
            <button
              onClick={onClose}
              aria-label="Close"
              className="rounded-md p-1 text-muted transition-colors hover:bg-surface hover:text-foreground"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="max-h-[70vh] space-y-6 overflow-y-auto px-5 py-5">
          {terminal ? (
            <div
              className={`rounded-lg px-3 py-2.5 text-sm ${
                order.status === "refunded"
                  ? "bg-foreground/5 text-muted"
                  : "bg-red-500/10 text-red-500"
              }`}
            >
              This order was {order.status}.
            </div>
          ) : (
            <div className="flex items-center">
              {STEPS.map((step, i) => {
                const done = i <= current;
                return (
                  <div key={step.key} className="flex flex-1 items-center last:flex-none">
                    <div className="flex flex-col items-center">
                      <span
                        className={`grid h-8 w-8 place-items-center rounded-full text-xs transition-colors ${
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
                        className={`mx-1 h-0.5 flex-1 rounded-full ${i < current ? "bg-accent-solid" : "bg-border"}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
              Items
            </p>
            <div className="space-y-3">
              {order.orderItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <img
                    src={itemImage(item)}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {item.name || "Item"}
                    </p>
                    {variantLabel(item) && (
                      <p className="text-xs text-muted">{variantLabel(item)}</p>
                    )}
                    <p className="text-xs text-muted">Qty {item.quantity}</p>
                  </div>
                  <p className="shrink-0 text-sm">
                    {naira(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {addr && (addr.addressLine1 || addr.fullName) && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                <MapPin size={13} /> Delivery
              </p>
              <div className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm">
                {addr.fullName && <p className="font-medium">{addr.fullName}</p>}
                <p className="text-muted">
                  {[addr.addressLine1, addr.addressLine2, addr.city, addr.state, addr.country]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                {addr.phone && <p className="text-muted">{addr.phone}</p>}
              </div>
            </div>
          )}

          <div className="space-y-1.5 border-t border-border pt-4 text-sm">
            <Row label="Subtotal" value={naira(subtotal)} muted />
            {order.tax !== undefined && (
              <Row label="VAT" value={naira(order.tax)} muted />
            )}
            {order.shippingFee !== undefined && (
              <Row
                label="Shipping"
                value={order.shippingFee === 0 ? "Free" : naira(order.shippingFee)}
                muted
              />
            )}
            <div className="flex justify-between pt-1.5 text-base font-semibold">
              <span>Total</span>
              <span className="text-accent">{naira(order.totalPrice)}</span>
            </div>
          </div>

          <p className="text-center text-xs text-muted">
            Placed on {fmtDate(order.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
};

const Row = ({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) => (
  <div className={`flex justify-between ${muted ? "text-muted" : ""}`}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
);
