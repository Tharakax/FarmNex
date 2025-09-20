import express from "express";
import {
  getAllNotifications,
  addNotifications,
  getById,
  updateNotification,
  deleteNotification,
} from "../controllers/NotificationControllers.js";

const router = express.Router();

router.get("/", getAllNotifications);
router.get("/:NotificationId", getById);
router.post("/", addNotifications);
router.put("/:NotificationId", updateNotification);
router.delete("/:NotificationId", deleteNotification);

export default router;