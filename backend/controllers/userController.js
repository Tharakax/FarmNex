import express from 'express';
import User from '../models/user.js';
import bcrypt from 'bcrypt';
import validator from 'validator';
import jwt from 'jsonwebtoken';


// Save a new user
export const saveUser = async (req, res) => {
  try {
    const { role, firstName, lastName, email, password, phone, address, farmDetails } = req.body;

    // Validate email
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // Validate phone if provided
    if (phone && !validator.isMobilePhone(phone)) {
      return res.status(400).json({ message: 'Please provide a valid phone number' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = new User({
      role,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      address,
      farmDetails: role === 'farmer' ? farmDetails : undefined,
      isVerified: role === 'customer' // Auto-verify customers, admins/farmers might need manual verification
    });

    // Save to database
    const savedUser = await newUser.save();

    // Remove password from response
    savedUser.password = undefined;

    res.status(201).json({
      message: 'User created successfully',
      user: savedUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

// Get a single user by ID
export async function loginUser(req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password; 
    
    const user = await User.findOne({
      email: email
    });

    if(user != null){
      try{
        
        const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        // Remove password from response
        const userdata = {
                    email : user.email,
                    name : user.name,
                    id : user._id,
                    role : user.role
                    
                }
                const token = jwt.sign(userdata , process.env.JWT_key) 
                return res.status(200).json({
                    message : "loggin success",
                    token : token,
                    user : user 
                })

      } else {
        return res.status(401).json({ message: 'Invalid password' });
        
      }
      }catch(error){
        return res.status(500).json({ message: 'Error comparing passwords', error: error.message });
      } 
      

    }else{
      return res.status(404).json({ message: 'User not found' });
      
    }

   
  } catch (error) {
    return res.status(500).json({ message: 'Error logging in', error: error.message });
  }
}

// Get all users with optional filtering
export const getAllUsers = async (req, res) => {
  try {
    // You can add query parameters for filtering (e.g., ?role=farmer)
    const { role } = req.query;
    const filter = role ? { role } : {};

    const users = await User.find(filter).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Update a user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow role changes via this endpoint (create separate admin endpoint if needed)
    if (updates.role) {
      return res.status(400).json({ message: 'Role cannot be changed this way' });
    }

    // If password is being updated, hash it first
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 12);
    }

    // Validate phone if being updated
    if (updates.phone && !validator.isMobilePhone(updates.phone)) {
      return res.status(400).json({ message: 'Please provide a valid phone number' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

// Delete a user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id).select('-password');

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User deleted successfully',
      user: deletedUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

// Get users by role
export const getByRole = async (req, res) => {
  try {
    const { role } = req.params;
    
    if (!['customer', 'admin', 'farmer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const users = await User.find({ role }).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users by role', error: error.message });
  }
};