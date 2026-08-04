import { Response } from "express";
import Notification from "../models/notifications.model";
import { AuthRequest } from "../middleware/auth";

export const getUserNotification = async (req: AuthRequest, res: Response) => {
  const notifications = await Notification.find({ user: req.user!.id })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(notifications);
};

export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  const count = await Notification.countDocuments({
    user: req.user!.id,
    read: false,
  });
  res.json({ count });
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const notification = await Notification.findOneAndUpdate(
    { _id: id, user: req.user!.id },
    { read: true },
    { new: true }
  );
  if (!notification) {
    return res.status(404).json({ message: "Notification not found" });
  }
  res.json(notification);
};

export const markAllRead = async (req: AuthRequest, res: Response) => {
  await Notification.updateMany(
    { user: req.user!.id, read: false },
    { $set: { read: true } }
  );
  res.json({ message: "All notifications marked read" });
};
