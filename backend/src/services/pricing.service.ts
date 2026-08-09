/**
 * Central order pricing — VAT and shipping, configured from env:
 *   VAT_PERCENT               (default 7.5, Nigeria)
 *   SHIPPING_FEE              flat fee in naira (default 1500)
 *   FREE_SHIPPING_THRESHOLD   subtotal at/above which shipping is free (default 50000)
 *
 * The server always recomputes totals from the DB-priced subtotal so the amount
 * charged can never be set by the client. The same config is exposed read-only
 * to the frontend for display, but display figures are never trusted.
 */
export interface PricingConfig {
  vatPercent: number;
  shippingFee: number;
  freeShippingThreshold: number;
}

export const pricingConfig = (): PricingConfig => ({
  vatPercent: Number(process.env.VAT_PERCENT ?? 7.5),
  shippingFee: Number(process.env.SHIPPING_FEE ?? 1500),
  freeShippingThreshold: Number(process.env.FREE_SHIPPING_THRESHOLD ?? 50000),
});

export interface OrderTotals {
  subtotal: number;
  tax: number;
  shippingFee: number;
  total: number;
}

export const computeTotals = (subtotal: number): OrderTotals => {
  const cfg = pricingConfig();
  const tax = Math.round(subtotal * (cfg.vatPercent / 100));
  const shippingFee =
    subtotal >= cfg.freeShippingThreshold ? 0 : cfg.shippingFee;
  return { subtotal, tax, shippingFee, total: subtotal + tax + shippingFee };
};
