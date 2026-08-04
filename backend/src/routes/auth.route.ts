import express from "express";
import rateLimit from "express-rate-limit";
import { registerUser, loginUser } from "../controllers/auth.controller";
import { validateBody } from "../middleware/validate";
import { registerSchema, loginSchema } from "../validation/auth.schema";

const router = express.Router();

// Throttle auth endpoints to blunt credential-stuffing / brute force.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again later" },
});

router.post("/register", authLimiter, validateBody(registerSchema), registerUser);
router.post("/login", authLimiter, validateBody(loginSchema), loginUser);

export default router;
