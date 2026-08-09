import { Router } from "express";
import {
  createBrand,
  getBrands,
  updateBrand,
  deleteBrand,
} from "../controllers/brand.controller";
import { protect } from "../middleware/auth";
import { authorizeRoles } from "../middleware/roles";

const router = Router();

router.get("/", getBrands);
// Only admins may mutate brands.
router.post("/", protect, authorizeRoles("admin"), createBrand);
router.put("/:id", protect, authorizeRoles("admin"), updateBrand);
router.delete("/:id", protect, authorizeRoles("admin"), deleteBrand);

export default router;
