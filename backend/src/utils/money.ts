/**
 * Money handling.
 *
 * Internally, amounts are whole **naira** stored as integers (NGN has no
 * sub-naira pricing in practice). This is the integer minor-unit discipline for
 * this currency: never carry fractional money, always round at computation
 * boundaries, and convert to **kobo** only at the Paystack edge.
 *
 * If the platform ever adds a currency with routine sub-unit pricing, switch the
 * stored unit to that currency's minor unit here and update `toKobo`.
 */

/** Coerce to a non-negative integer amount of naira. */
export const toNaira = (value: unknown): number =>
  Math.max(0, Math.round(Number(value) || 0));

/** True for a clean, non-negative integer money value. */
export const isValidMoney = (value: unknown): boolean =>
  typeof value === "number" && Number.isFinite(value) && value >= 0 && Number.isInteger(value);

/** Naira -> kobo (Paystack expects the minor unit). */
export const toKobo = (naira: number): number => Math.round(naira * 100);

/** Kobo -> naira. */
export const fromKobo = (kobo: number): number => Math.round(kobo) / 100;
