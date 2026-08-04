import Notification from "../models/notifications.model";

type NotifType = "order" | "promo" | "system";

/**
 * Best-effort notification creation. Never throws — a failed notification must
 * not roll back or fail the business action that triggered it.
 */
export const createNotification = async (
  user: unknown,
  message: string,
  type: NotifType = "system"
): Promise<void> => {
  try {
    await Notification.create({ user, message, type });
  } catch (err) {
    console.error("[notify] failed to create notification:", err);
  }
};
