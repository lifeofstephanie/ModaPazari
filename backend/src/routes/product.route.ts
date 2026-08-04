import { Router } from "express";
import {
  createProduct,
  getProducts,
  getFeed,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller";
import { protect } from "../middleware/auth";
import { authorizeRoles } from "../middleware/roles";

const router = Router();

// Direct product mutations are admin-only. Vendors manage their own catalog
// through /api/vendor/products, which enforces ownership.
router.post("/", protect, authorizeRoles("admin"), createProduct);
router.get("/", getProducts);
// Must be registered before "/:id" so "feed" isn't captured as an id param.
router.get("/feed", getFeed);
router.get("/:id", getProductById);
router.put("/:id", protect, authorizeRoles("admin"), updateProduct);
router.delete("/:id", protect, authorizeRoles("admin"), deleteProduct);

export default router;
