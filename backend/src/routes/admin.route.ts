import express from "express";
import {
  getStats,
  getAllUsers,
  deleteUsers,
  getAllOrders,
  getAdminProducts,
  setProductStatus,
  getVendors,
  setVendorStatus,
  refundOrder,
  getPromos,
  createPromo,
  updatePromo,
  deletePromo,
} from "../controllers/admin.controller";
import { protect } from "../middleware/auth";
import { authorizeRoles } from "../middleware/roles";

const router = express.Router();

router.use(protect, authorizeRoles("admin"));

router.get("/stats", getStats);
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUsers);
router.get("/orders", getAllOrders);
router.post("/orders/:id/refund", refundOrder);
router.get("/promos", getPromos);
router.post("/promos", createPromo);
router.put("/promos/:id", updatePromo);
router.delete("/promos/:id", deletePromo);
router.get("/products", getAdminProducts);
router.patch("/products/:id/status", setProductStatus);
router.get("/vendors", getVendors);
router.patch("/vendors/:id/status", setVendorStatus);

export default router;
