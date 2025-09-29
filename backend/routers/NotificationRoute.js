import express from "express";
import {
  getAllNotifications,
  addNotifications,
  getById,
  updateNotification,
  deleteNotification,
  getNotificationsByRole,
  getNotificationStats,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
} from "../controllers/NotificationControllers.js";

const router = express.Router();

// General routes
router.get("/", getAllNotifications);
router.post("/", addNotifications);

// Role-based routes
router.get("/role/:role", getNotificationsByRole); // /api/notifications/role/farmer or /api/notifications/role/user
router.get("/stats/:role", getNotificationStats); // /api/notifications/stats/farmer or /api/notifications/stats/user
router.get("/audience/:audience", getNotificationsByRole); // /api/notifications/audience/FARMER (alias for role-based)

// Read tracking routes
router.patch("/:NotificationId/read", markNotificationAsRead); // Mark single notification as read
router.patch("/read-all", markAllNotificationsAsRead); // Mark all notifications as read for user
router.get("/unread-count", getUnreadCount); // Get unread count for user

// Individual notification routes
router.get("/:NotificationId", getById);
router.put("/:NotificationId", updateNotification);
router.delete("/:NotificationId", deleteNotification);

export default router;