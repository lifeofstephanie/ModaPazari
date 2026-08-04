import { Router } from "express";
import { protect } from "../middleware/auth";
import { addToCart, getCart, mergeCart, removeFromCart } from "../controllers/cart.controller";

const router = Router()

router.use(protect)
router.post('/', addToCart)
router.post('/merge', mergeCart)
router.get('/', getCart)
router.delete('/:productId', removeFromCart)

export default router