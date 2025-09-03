import { Router } from "express";
import { protect } from "../middleware/auth";
import { createReview, getProductReviews } from "../controllers/review.controller";

const router = Router()

router.post('/:productId', protect, createReview)
router.get('/:productId', getProductReviews)

export default router