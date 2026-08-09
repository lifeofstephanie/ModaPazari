import express from "express";
import { makeLimiter } from "../config/rateLimit";
import {
  registerUser,
  loginUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller";
import { validateBody } from "../middleware/validate";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../validation/auth.schema";

const router = express.Router();

// Throttle auth endpoints to blunt credential-stuffing / brute force.
const authLimiter = makeLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many attempts, please try again later" },
});

router.post("/register", authLimiter, validateBody(registerSchema), registerUser);
router.post("/login", authLimiter, validateBody(loginSchema), loginUser);
router.post("/verify-email", validateBody(verifyEmailSchema), verifyEmail);
router.post(
  "/forgot-password",
  authLimiter,
  validateBody(forgotPasswordSchema),
  forgotPassword
);
router.post(
  "/reset-password",
  authLimiter,
  validateBody(resetPasswordSchema),
  resetPassword
);

export default router;
