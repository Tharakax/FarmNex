import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    notificationId: {
      type: String,
      unique: true,
      required: true,
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
      enum: ["FARMER", "USER", "BOTH"],
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
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;