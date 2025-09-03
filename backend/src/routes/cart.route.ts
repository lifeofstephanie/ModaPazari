import { Router } from "express";
import { protect } from "../middleware/auth";
import { addToCart, getCart, removeFromCart } from "../controllers/cart.controller";

const router = Router()

router.use(protect)
router.post('/', addToCart)
router.get('/', getCart)
router.delete('/:productId', removeFromCart)

export default router