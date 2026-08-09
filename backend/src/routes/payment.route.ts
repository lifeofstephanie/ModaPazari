import { Router } from "express";
import { makeLimiter } from "../config/rateLimit";
import { protect } from "../middleware/auth";
import { initializePayment, verifyPayment } from "../controllers/payment.controller";

const router = Router();

// Tighter limit on payment endpoints than the global throttle.
const payLimiter = makeLimiter({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: { message: "Too many payment attempts, please try again later" },
});

router.post("/initiate", payLimiter, protect, initializePayment);
router.get("/verify/:transaction_id", payLimiter, verifyPayment);
// NOTE: the Paystack webhook is mounted in app.ts with express.raw() (before the
// global JSON parser) because signature verification needs the raw request body.

export default router;
