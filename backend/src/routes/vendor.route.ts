import express from "express";
import { getVendorProducts } from "../controllers/vendor.controller";
import { protect } from "../middleware/auth";
import { authorizeRoles } from "../middleware/roles";

const router = express.Router();

router.get("/products", protect, authorizeRoles("vendor"), getVendorProducts);

export default router;
