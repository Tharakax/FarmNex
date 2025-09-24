import express from "express";
import {
  getAllNotifications,
  addNotifications,
  getById,
  updateNotification,
  deleteNotification,
  getNotificationsByRole,
  getNotificationStats,
} from "../controllers/NotificationControllers.js";

const router = express.Router();

// General routes
router.get("/", getAllNotifications);
router.post("/", addNotifications);

// Role-based routes
router.get("/role/:role", getNotificationsByRole); // /api/notifications/role/farmer or /api/notifications/role/user
router.get("/stats/:role", getNotificationStats); // /api/notifications/stats/farmer or /api/notifications/stats/user
router.get("/audience/:audience", getNotificationsByRole); // /api/notifications/audience/FARMER (alias for role-based)

// Individual notification routes
router.get("/:NotificationId", getById);
router.put("/:NotificationId", updateNotification);
router.delete("/:NotificationId", deleteNotification);

export default router;