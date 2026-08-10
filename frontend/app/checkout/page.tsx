"use client";

import { useCartStore } from "@/store/useCartStore";
import {
  authService,
  orderService,
  paymentService,
  pricingService,
  type PricingConfig,
} from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { LockIcon, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

type AddressForm = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

export default function Checkout() {
  const router = useRouter();
  const { items, removeItem } = useCartStore();
  const user = useAuthStore((s) => s.user);

  const [mounted, setMounted] = useState(false);
  const [terms, setTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<AddressForm>({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Nigeria",
  });

  // Stable per-attempt key so a retried Pay Now doesn't create duplicate orders.
  const [idempotencyKey] = useState(() =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : String(Date.now())
  );

  const [pricing, setPricing] = useState<PricingConfig | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    pricingService
      .get()
      .then(({ data }) => setPricing(data))
      .catch(() => {});
  }, []);

  // Prefill from the buyer's saved profile address (only fills empty fields).
  useEffect(() => {
    if (!mounted || !user) return;
    authService
      .getMe()
      .then(({ data }) =>
        setForm((f) => ({
          ...f,
          fullName:
            f.fullName ||
            `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim(),
          phone: f.phone || data.address?.phone || "",
          addressLine1: f.addressLine1 || data.address?.addressLine1 || "",
          addressLine2: f.addressLine2 || data.address?.addressLine2 || "",
          city: f.city || data.address?.city || "",
          state: f.state || data.address?.state || "",
          postalCode: f.postalCode || data.address?.postalCode || "",
          country: data.address?.country || f.country,
        }))
      )
      .catch(() => {});
  }, [mounted, user]);

  // Prefill name from the signed-in user; guard the route.
  useEffect(() => {
    if (!mounted) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    setForm((f) => ({
      ...f,
      fullName:
        f.fullName ||
        [user.firstName, user.lastName].filter(Boolean).join(" "),
    }));
  }, [mounted, user, router]);

  const subtotal = useMemo(
    () =>
      items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0),
    [items]
  );

  // Display estimate mirroring the server's rules; the server recomputes the
  // authoritative amount at checkout.
  const tax = pricing ? Math.round(subtotal * (pricing.vatPercent / 100)) : 0;
  const shipping =
    pricing && subtotal < pricing.freeShippingThreshold ? pricing.shippingFee : 0;
  const total = subtotal + tax + shipping;

  const set = (key: keyof AddressForm, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handlePay = async () => {
    if (items.length === 0) return toast.error("Your cart is empty");
    if (!terms) return toast.error("Please accept the terms to continue");

    const required: (keyof AddressForm)[] = [
      "fullName",
      "phone",
      "addressLine1",
      "city",
      "state",
    ];
    for (const field of required) {
      if (!form[field].trim()) {
        return toast.error(`Please enter your ${field}`);
      }
    }

    try {
      setSubmitting(true);
      // 1. Create the pending order (server re-prices from the DB).
      const { data: order } = await orderService.checkout(
        items.map((i) => ({
          product: i.productId,
          quantity: i.quantity,
          color: i.color || undefined,
          size: i.size || undefined,
        })),
        form,
        idempotencyKey
      );

      // 2. Initialise Paystack payment for that order.
      const { data: init } = await paymentService.initiate(
        order._id,
        `${window.location.origin}/payment/callback`
      );
      const url = init?.data?.authorization_url;
      if (!url) throw new Error("Could not start payment");

      // 3. Hand off to Paystack. The cart is cleared on the return page after
      //    the payment is verified, so an abandoned payment keeps the cart.
      window.location.href = url;
    } catch {
      // interceptor surfaces the error toast
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-surface px-5 pb-20 pt-28 md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:gap-12">
        {/* Left: address */}
        <section className="w-full md:flex-1">
          <h2 className="mb-6 font-serif text-2xl font-bold italic tracking-tight text-accent md:text-3xl">
            Checkout
          </h2>

          <p className="font-semibold">Shipping information</p>
          <div className="mt-4 grid grid-cols-1 gap-4">
            <FormRow>
              <FormField label="Full name" required>
                <input
                  value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  className="co-input"
                  placeholder="Full name"
                />
              </FormField>
              <FormField label="Phone" required>
                <input
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  className="co-input"
                  placeholder="+234…"
                />
              </FormField>
            </FormRow>

            <FormField label="Address" required>
              <input
                value={form.addressLine1}
                onChange={(e) => set("addressLine1", e.target.value)}
                className="co-input"
                placeholder="Street address"
              />
            </FormField>
            <FormField label="Apartment, suite, etc. (optional)">
              <input
                value={form.addressLine2}
                onChange={(e) => set("addressLine2", e.target.value)}
                className="co-input"
                placeholder="Apartment, unit…"
              />
            </FormField>

            <FormRow>
              <FormField label="City" required>
                <input
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  className="co-input"
                  placeholder="City"
                />
              </FormField>
              <FormField label="State" required>
                <input
                  value={form.state}
                  onChange={(e) => set("state", e.target.value)}
                  className="co-input"
                  placeholder="State"
                />
              </FormField>
            </FormRow>

            <FormRow>
              <FormField label="Postal code (optional)">
                <input
                  value={form.postalCode}
                  onChange={(e) => set("postalCode", e.target.value)}
                  className="co-input"
                  placeholder="Postal code"
                />
              </FormField>
              <FormField label="Country">
                <input
                  value={form.country}
                  onChange={(e) => set("country", e.target.value)}
                  className="co-input"
                />
              </FormField>
            </FormRow>
          </div>

          <label className="mt-6 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              className="h-4 w-4 accent-[var(--accent-solid)]"
            />
            I have read and agree to the{" "}
            <a href="/terms" className="text-accent hover:underline">
              Terms &amp; Conditions
            </a>
          </label>
        </section>

        {/* Right: summary */}
        <section className="h-fit w-full rounded-2xl border border-border bg-card p-6 md:sticky md:top-28 md:w-[380px] md:shrink-0">
          <p className="font-semibold">Review your cart</p>

          <div className="mt-4 space-y-4">
            {items.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">
                Your cart is empty.
              </p>
            ) : (
              items.map((item) => (
                <div key={item.cartId} className="flex gap-3">
                  <img
                    src={item.imageUrl}
                    className="h-20 w-20 rounded-lg object-cover"
                    loading="lazy"
                    alt={item.title}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-accent">{item.title}</p>
                    {(item.color || item.size) && (
                      <p className="text-xs text-muted">
                        {[item.color, item.size].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    <p className="text-xs text-muted">{item.quantity}x</p>
                    <p className="text-sm">{naira(Number(item.price))}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.cartId)}
                    aria-label="Remove"
                    className="self-start text-muted transition-colors hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span>{naira(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>VAT{pricing ? ` (${pricing.vatPercent}%)` : ""}</span>
              <span>{naira(tax)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : naira(shipping)}</span>
            </div>
            <div className="flex justify-between pt-1 text-base font-semibold">
              <span>Total</span>
              <span className="text-accent">{naira(total)}</span>
            </div>
          </div>

          <button
            onClick={handlePay}
            disabled={submitting || items.length === 0}
            className="mt-6 w-full rounded-md bg-accent-solid py-3 font-medium text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Redirecting to Paystack…" : "Pay now"}
          </button>

          <div className="mt-4 flex items-center gap-2 text-sm text-muted">
            <LockIcon size={16} className="text-accent" />
            Secure checkout via Paystack
          </div>
        </section>
      </div>

      <style jsx global>{`
        .co-input {
          width: 100%;
          height: 3rem;
          border-radius: 0.5rem;
          border: 1px solid var(--border);
          background: var(--card);
          padding: 0 1rem;
          font-size: 0.875rem;
          color: var(--foreground);
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .co-input::placeholder {
          color: var(--muted);
          opacity: 0.7;
        }
        .co-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--ring);
        }
      `}</style>
    </main>
  );
}

const FormRow = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
);

const FormField = ({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium">
      {label}
      {required && <span className="text-accent"> *</span>}
    </label>
    {children}
  </div>
);
