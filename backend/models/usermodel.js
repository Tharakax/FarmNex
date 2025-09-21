import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    phone: {
      type: String,
      default: null
    },
    age: {
      type: Number,
      required: true
    },
    username: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['Admin', 'FarmStaff', 'Manager', 'DeliveryStaff','Customer'],
      default: 'FarmStaff',
      required: true
    },
    address: {
      type: String,
      default: ''
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    otp: {
      type: String,
      default: null
    },
    otpExpiresAt: {
      type: Date,
      default: null
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active'
    }
  },
  { collection: "usermodels" } 
);

const User = mongoose.model("User", userSchema);

export default User;
