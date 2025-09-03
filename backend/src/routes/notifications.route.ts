import { Router } from "express";
import { protect } from "../middleware/auth";
import { getUserNotification, markAsRead } from "../controllers/notification.controller";

const router = Router()

router.use(protect)
router.get('/',getUserNotification )
router.put('/:id/read', markAsRead)

export default router