import { Router } from "express";
import {
  createBrand,
  getBrands,
  updateBrand,
  deleteBrand,
} from "../controllers/brand.controller";
import { protect } from "../middleware/auth";

const router = Router();

router.post("/", protect, createBrand);
router.get("/", getBrands);
router.put("/:id", protect, updateBrand);
router.delete("/:id", protect, deleteBrand);

export default router;
