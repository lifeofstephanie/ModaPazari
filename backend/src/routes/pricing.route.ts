import { Router } from "express";
import { pricingConfig } from "../services/pricing.service";

const router = Router();

// Public: VAT % + shipping rules so the storefront can show a matching breakdown.
// The server still recomputes authoritative totals at checkout.
router.get("/", (_req, res) => res.json(pricingConfig()));

export default router;
