import { Router } from "express";
import {
  createOrder,
  checkout,
  promoCheckout,
  getOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/order.controller";
import { protect } from "../middleware/auth";
import { authorizeRoles } from "../middleware/roles";
import { makeLimiter } from "../config/rateLimit";

const router = Router();

// Throttle order creation to blunt spam / accidental double-submits.
const checkoutLimiter = makeLimiter({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: { message: "Too many checkout attempts, please try again later" },
});

router.post("/", protect, createOrder);
router.post("/checkout", checkoutLimiter, protect, checkout);
router.post("/promo-checkout", protect, promoCheckout);
// "mine" must be registered before "/:id" so it isn't captured as an id.
router.get("/mine", protect, getMyOrders);
router.get("/", protect, authorizeRoles("admin"), getOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id", protect, authorizeRoles("admin"), updateOrderStatus);

export default router;
