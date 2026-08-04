import express from "express";
import {
  getVendorProducts,
  getVendorOrders,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/vendor.controller";
import { protect } from "../middleware/auth";
import { authorizeRoles } from "../middleware/roles";

const router = express.Router();

// Every vendor route requires an authenticated vendor.
router.use(protect, authorizeRoles("vendor"));

router.get("/products", getVendorProducts);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

router.get("/orders", getVendorOrders);

export default router;
