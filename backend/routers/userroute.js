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

router.get("/", getAllUsers); // Get all users - SECURED by global middleware
router.post("/", addAllUsers); // Add user - for admins to create users  
router.get("/:id", getById); // SECURED by global middleware
router.put("/:id", updateUser); // Update user - SECURED by global middleware
router.delete("/:id", deleteUser); // Delete user - SECURED by global middleware

// Login routes moved to public routes in main app

router.post("/change-password", authMiddleware, changePassword); // Change password for user

// Debug endpoint to check if user exists
router.get("/debug/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const user = await (await import("../models/usermodel.js")).default.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      return res.json({ 
        exists: false, 
        message: "User not found",
        searchedEmail: email.toLowerCase().trim()
      });
    }
    
    return res.json({ 
      exists: true,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        currentOTP: user.otp,
        otpExpiresAt: user.otpExpiresAt,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
