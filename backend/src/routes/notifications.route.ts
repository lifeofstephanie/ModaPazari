import { Router } from "express";
import { protect } from "../middleware/auth";
import {
  getUserNotification,
  getUnreadCount,
  markAsRead,
  markAllRead,
} from "../controllers/notification.controller";

const router = Router();

router.use(protect);
router.get("/", getUserNotification);
router.get("/unread-count", getUnreadCount);
router.put("/read-all", markAllRead);
router.put("/:id/read", markAsRead);

export default router;
