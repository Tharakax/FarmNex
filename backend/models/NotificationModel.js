import mongoose from "mongoose";

function generateNotificationId() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `NOT-${timestamp}-${random}`;
}

const notificationSchema = new mongoose.Schema(
  {
    notificationId: {
      type: String,
      unique: true,
      default: generateNotificationId,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 10000,
    },
    audience: {
      type: String,
      enum: ["FARMER", "USER", "ADMIN", "BOTH", "ALL"],
      required: true,
    },
    type: {
      type: String,
      enum: ["ALERT", "OFFER", "UPDATE"],
      default: "UPDATE",
      index: true,
    },
    priority: {
      type: String,
      enum: ["HIGH", "MEDIUM", "LOW"],
      default: "MEDIUM",
      index: true,
    },
    sendEmail: {
      type: Boolean,
      default: false,
      index: true,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: {
      type: Date,
    },
    // Track which users have read this notification
    readBy: {
      type: [{
        userId: String,
        readAt: {
          type: Date,
          default: Date.now
        }
      }],
      default: []
    },
    // General read status (for backward compatibility)
    isRead: {
      type: Boolean,
      default: false
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;