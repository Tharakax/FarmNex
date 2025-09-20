import Notification from "../models/NotificationModel.js";

// Display - Get (all)
const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find();

    if (!notifications || notifications.length === 0) {
      return res.status(404).json({ message: "No notifications found" });
    }

    return res.status(200).json({ notifications });
  } catch (err) {
    console.error("getAllNotifications error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Insert - Post
const addNotifications = async (req, res) => {
  try {
    const { notificationId, title, body, audience, type, priority } = req.body;

    if (!notificationId || !title || !body || !audience || !type || !priority) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const notification = await Notification.create({
      notificationId,
      title,
      body,
      audience,
      type,
      priority,
    });

    return res.status(201).json({ notification });
  } catch (err) {
    console.error("addNotifications error:", err);

    if (err.code === 11000) {
      return res.status(409).json({ message: "notificationId must be unique" });
    }

    return res.status(400).json({ message: err.message || "Invalid data" });
  }
};

// Get by id
const getById = async (req, res) => {
  const id = req.params.NotificationId;

  try {
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.status(200).json({ notification });
  } catch (err) {
    console.error("getById error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update - Put
const updateNotification = async (req, res) => {
  const id = req.params.NotificationId;
  const { notificationId, title, body, audience, type, priority } = req.body;

  try {
    if (!notificationId || !title || !body || !audience || !type || !priority) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const notification = await Notification.findByIdAndUpdate(
      id,
      {
        notificationId,
        title,
        body,
        audience,
        type,
        priority,
      },
      { new: true, runValidators: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.status(200).json({ notification });
  } catch (err) {
    console.error("updateNotification error:", err);

    if (err.code === 11000) {
      return res.status(409).json({ message: "notificationId must be unique" });
    }

    return res.status(400).json({ message: err.message || "Invalid data" });
  }
};

// Delete - Delete
const deleteNotification = async (req, res) => {
  const id = req.params.NotificationId;

  try {
    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res
      .status(200)
      .json({ message: "Notification deleted successfully", notification });
  } catch (err) {
    console.error("deleteNotification error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export {
  getAllNotifications,
  addNotifications,
  getById,
  updateNotification,
  deleteNotification,
};