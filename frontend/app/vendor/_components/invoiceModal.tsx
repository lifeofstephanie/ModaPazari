"use client";

import { Check, Download, X } from "lucide-react";
import toast from "react-hot-toast";
import type { VendorOrder } from "../_data/orders";

const PRODUCT_POOL = [
  "Silk Wrap Midi Dress",
  "Aeroflow Linen Shirt",
  "Suede Ankle Boots",
  "Cashmere Scarf",
  "Structured Wool Jacket",
  "Handwoven Gold Ring Set",
  "Pleated Maxi Skirt",
];

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;
const parseNaira = (s: string) => Number(s.replace(/[^\d.]/g, "")) || 0;

// Build a plausible line-item breakdown that sums exactly to the order total.
const buildLineItems = (order: VendorOrder) => {
  const total = parseNaira(order.total);
  const count = Math.max(1, order.items);
  const per = Math.floor(total / count);
  return Array.from({ length: count }, (_, i) => {
    const amount = i === count - 1 ? total - per * (count - 1) : per;
    const seed = (parseInt(order.id.replace(/\D/g, "") || "0", 10) + i) %
      PRODUCT_POOL.length;
    return { name: PRODUCT_POOL[seed], qty: 1, amount };
  });
};

export type InvoiceLineItem = { name: string; qty: number; amount: number };

type InvoiceModalProps = {
  order: VendorOrder | null;
  // Real line items when available; otherwise a plausible split is synthesised.
  lineItems?: InvoiceLineItem[];
  onClose: () => void;
};

export const InvoiceModal = ({
  order,
  lineItems: provided,
  onClose,
}: InvoiceModalProps) => {
  if (!order) return null;

  const lineItems = provided && provided.length ? provided : buildLineItems(order);
  const subtotal = lineItems.reduce((s, l) => s + l.amount, 0);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-foreground/50"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header band */}
        <div className="flex items-start justify-between border-b border-border bg-surface px-6 py-5">
          <div>
            <p className="font-[MomoSignature] text-2xl leading-none text-accent">
              Moda Pazari
            </p>
            <p className="mt-1 text-xs text-muted">Vendor invoice</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              Invoice
            </p>
            <p className="text-lg font-semibold">{order.id}</p>
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <Check size={12} />
              {order.payment}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 rounded-md p-1 text-muted transition-colors hover:bg-card hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-4 px-6 py-5 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Billed to</p>
            <p className="mt-1 font-medium">{order.customer}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-muted">Date</p>
            <p className="mt-1 font-medium">{order.date}</p>
            <p className="mt-2 text-xs uppercase tracking-wide text-muted">Status</p>
            <p className="mt-1 font-medium">{order.status}</p>
          </div>
        </div>

        {/* Line items */}
        <div className="px-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-y border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="py-2 pr-3 font-medium">Item</th>
                <th className="py-2 pr-3 text-center font-medium">Qty</th>
                <th className="py-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((l, i) => (
                <tr key={i} className="border-b border-border/60">
                  <td className="py-2.5 pr-3">{l.name}</td>
                  <td className="py-2.5 pr-3 text-center text-muted">{l.qty}</td>
                  <td className="py-2.5 text-right">{naira(l.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="space-y-1.5 px-6 py-5 text-sm">
          <div className="flex justify-between text-muted">
            <span>Subtotal</span>
            <span>{naira(subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-border pt-3 text-base font-semibold">
            <span>Total</span>
            <span className="text-accent">{naira(subtotal)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-border bg-surface px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-md border border-border bg-card px-4 py-2 text-sm transition-colors hover:bg-surface"
          >
            Close
          </button>
          <button
            onClick={() => toast.success(`Invoice ${order.id} downloaded`)}
            className="inline-flex items-center gap-1.5 rounded-md bg-accent-solid px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
          >
            <Download size={15} />
            Download
          </button>
        </div>
      </div>
    </div>
  );
};
