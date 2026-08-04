import { Router } from "express";
import {
  createOrder,
  checkout,
  promoCheckout,
  getOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/order.controller";
import { protect } from "../middleware/auth";

const router = Router();

router.post("/", protect, createOrder);
router.post("/checkout", protect, checkout);
router.post("/promo-checkout", protect, promoCheckout);
router.get("/", protect, getOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id", protect, updateOrderStatus);

export default router;
