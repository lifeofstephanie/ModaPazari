import express from "express";
import { getAllUsers, deleteUsers, getAllOrders, manageProducts } from "../controllers/admin.controller";
import { protect } from "../middleware/auth";
import { authorizeRoles } from "../middleware/roles";

const router = express.Router();

router.use(protect, authorizeRoles("admin"))
router.get("/users",  getAllUsers);
router.delete('/users/:id', deleteUsers)
router.get('/orders', getAllOrders)
router.post('/products/manage', manageProducts)

export default router;
