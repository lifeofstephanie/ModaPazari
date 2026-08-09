import express from "express";
import {
  getVendorProducts,
  getVendorOrders,
  updateVendorOrderStatus,
  getVendorStats,
  createProduct,
  updateProduct,
  deleteProduct,
  getBanks,
  getPayoutAccount,
  setupPayoutAccount,
} from "../controllers/vendor.controller";
import { protect } from "../middleware/auth";
import { authorizeRoles } from "../middleware/roles";

const router = express.Router();

// Every vendor route requires an authenticated vendor.
router.use(protect, authorizeRoles("vendor"));

router.get("/stats", getVendorStats);

router.get("/products", getVendorProducts);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

router.get("/orders", getVendorOrders);
router.patch("/orders/:id/status", updateVendorOrderStatus);

router.get("/banks", getBanks);
router.get("/payout-account", getPayoutAccount);
router.post("/payout-account", setupPayoutAccount);

export default router;
