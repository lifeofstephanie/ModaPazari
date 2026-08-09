import { Router } from "express";
import { protect } from "../middleware/auth";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeCart,
} from "../controllers/cart.controller";

const router = Router();

router.use(protect);
router.get("/", getCart);
router.post("/", addToCart);
router.post("/merge", mergeCart);
router.put("/item/:itemId", updateCartItem);
router.delete("/item/:itemId", removeFromCart);
router.delete("/", clearCart);

export default router;
