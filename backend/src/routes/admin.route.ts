import express from "express";
import {
  getStats,
  getAllUsers,
  deleteUsers,
  getAllOrders,
  getAdminProducts,
  setProductStatus,
} from "../controllers/admin.controller";
import { protect } from "../middleware/auth";
import { authorizeRoles } from "../middleware/roles";

const router = express.Router();

router.use(protect, authorizeRoles("admin"));

router.get("/stats", getStats);
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUsers);
router.get("/orders", getAllOrders);
router.get("/products", getAdminProducts);
router.patch("/products/:id/status", setProductStatus);

export default router;
