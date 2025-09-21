import express from "express";
import {
  getAllUsers,
  addAllUsers,
  loginUser,
  getById,
  updateUser,
  deleteUser,
  changePassword,
  loginWithOTPStep1,
  verifyOTP,
} from "../controllers/usercontrol.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllUsers); // Get all users
router.post("/", addAllUsers); // Add user
router.post("/login", loginUser); // Login route sends OTP
router.get("/:id", getById);
router.put("/:id", updateUser); // Update user
router.delete("/:id", deleteUser); // Delete user

router.post("/login-otp-step1", loginWithOTPStep1);  
router.post("/verifyOTP", verifyOTP);  
router.post("/verify-otp", verifyOTP);  

router.post("/change-password", authMiddleware, changePassword); // Change password for user

export default router;
