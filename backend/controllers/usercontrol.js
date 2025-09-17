import User from "../models/usermodel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendMail from "../utils/sendMail.js";
import crypto from "crypto";

// Get all users 
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find(); //fetch all user collection from DB
    //await → waits until DB finishes fetching
    if (!users || users.length === 0) {
           return res.status(404).json({ message: "No users found" });
    }
        return res.status(200).json({ users });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
};

// Add user for admin and register a new user self
export const addAllUsers = async (req, res, next) => {
  const {
    fullName,
    email,
    phone,
       age,
    username,
    password,
    role,
    address,
    createdAt,
  } = req.body;

  // Allow only specific roles
  const allowedRoles = ['Admin', 'FarmStaff', 'Manager', 'DeliveryStaff', 'Customer']; //we can manage role
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: "User already exists with this email" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ //create user object
      fullName,
      email:email.toLowerCase().trim(),
      phone,
      age,
      username,
      password: hashedPassword,
      role,
      address,
      createdAt,
    });

    await user.save(); //save user DB
    return res.status(201).json({ user });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to register user" });
  }
};

// login user valiadte email password
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Normalize email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    try {
      await sendMail(user.email, 'Your Login OTP', `Your OTP for login is: ${otp}. It will expire in 10 minutes.`);
    } catch (mailError) {
      console.error('Email send error:', mailError);
      return res.status(500).json({ message: "Failed to send OTP email" });
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email",
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      }
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Login failed" });
  }
};


//login user valiadte only email (option forrget password)
export const loginWithOTPStep1 = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // gen 6 digit otp
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min exp

    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    // Send OTP via email
    try {
      await sendMail(user.email, 'Your Login OTP', `Your OTP for login is: ${otp}. This OTP will expire in 10 minutes.`);
    } catch (mailError) {
      console.error('Email send error:', mailError);
      return res.status(500).json({ 
        success: false,
        message: "Failed to send OTP email" 
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email',
      email: user.email
    });

  } catch (error) {
    console.error("Error in loginWithOTPStep1:", error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

//  Verify OTP and complete login
export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    console.log(`Verification attempt for ${email} at ${new Date()}`);
    console.log(`Received OTP: ${otp}`);

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
        code: "MISSING_FIELDS"
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      console.log('User not found in database');
      return res.status(404).json({ 
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND"
      });
    }

    console.log(`Database OTP: ${user.otp}`);
    console.log(`OTP Expires At: ${user.otpExpiresAt}`);

    if (!user.otp) {
      console.log('No OTP found for user');
      return res.status(400).json({
        success: false,
        message: "No OTP generated for this user. Please request a new OTP.",
        code: "NO_OTP"
      });
    }

    // Check expiration first
    if (user.otpExpiresAt && new Date() > new Date(user.otpExpiresAt)) {
      console.log('OTP expired');
      // Clear expired OTP
      user.otp = undefined;
      user.otpExpiresAt = undefined;
      await user.save();
      
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
        code: "OTP_EXPIRED"
      });
    }

    // Compare otp user enter and DB otp
    const cleanDbOtp = user.otp.toString().trim();
    const cleanInputOtp = otp.toString().trim();

    console.log(`Comparing DB OTP (${cleanDbOtp}) with Input (${cleanInputOtp})`);

    if (cleanDbOtp !== cleanInputOtp) {
      console.log('OTP mismatch');
      return res.status(400).json({
        success: false,
        message: "Invalid OTP code",
        code: "INVALID_OTP"
      });
    }

    // OTP is valid - clear it and generate JWT token
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    user.isVerified = true;
    await user.save();

    //gen jwt
    const token = jwt.sign(
      { 
        id: user._id,  // Using 'id' to match the changePassword function
        userId: user._id,  // Also including 'userId' for compatibility
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('OTP verification successful');
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        id: user._id,
        name: user.fullName,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get user by id
export const getById = async (req, res, next) => {
  const id = req.params.id;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ user });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error retrieving user" });
  }
};           

// Update user by id
export const updateUser = async (req, res, next) => {
  const id = req.params.id;
  const { fullName, phone, age, username, address } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { fullName, phone, age, username, address },
      { new: true }
    );
    if (!user) return res.status(400).json({ message: "User not updated" });
    return res.status(200).json({ user });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Failed to update user" });
  }
};

// Delete user by ID
export const deleteUser = async (req, res, next) => {
  const id = req.params.id;
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(400).json({ message: "User not deleted" });
    return res.status(200).json({ user });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error deleting user" });
  }
};

// Change password
export const changePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id; //get useer id varibale inside userId

  try {
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // update password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Failed to change password" });
  }
};

// exports
// exports.getAllUsers = getAllUsers;
// exports.addAllUsers = addAllUsers;
// exports.loginUser = loginUser;
// exports.getById = getById;
// exports.updateUser = updateUser;
// exports.deleteUser = deleteUser;
// exports.changePassword = changePassword;
// exports.loginWithOTPStep1 = loginWithOTPStep1;
// exports.verifyOTP = verifyOTP;