import { Router } from "express";
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller";
import { protect } from "../middleware/auth";

const router = Router();

router.post("/", protect, createCategory);
router.get("/", getCategories);
router.put("/:id", protect, updateCategory);
router.delete("/:id", protect, deleteCategory);

export default router;
