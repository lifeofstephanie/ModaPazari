import { Router } from "express";
// import { app } from "../app";
import { protect } from "../middleware/auth";
import {
  addToWishList,
  getWishlist,
  removeFromWishList,
} from "../controllers/wishlist.controller";

const router = Router();

router.use(protect);
router.post("/", addToWishList);
router.get("/", getWishlist);
router.delete("/:productId", removeFromWishList);

export default router;
