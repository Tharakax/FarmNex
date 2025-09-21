import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import dotenv from 'dotenv';
dotenv.config();

const JWTauth = async (req, res, next) => {
  try {
    const header = req.header("Authorization");
    
    if (header != null) {
      const token = header.replace("Bearer ", "");
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_key);
        
        if (decoded != null) {
          console.log(decoded);
          
          // Get full user details from database
          const user = await User.findById(decoded.id).select('-password');
          
          if (user) {
            // Add both decoded token data and full user data
            req.user = {
              id: decoded.id,
              email: decoded.email,
              name: decoded.name,
              role: decoded.role,
              ...user.toObject() // Add full user details
            };
          } else {
            // If user not found in DB, use token data
            req.user = decoded;
          }
        }
      } catch (jwtError) {
        console.error('JWT verification error:', jwtError);
        // Don't block the request, just log the error
        // Some routes might not need authentication
      }
    }
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    next();
  }
};

export default JWTauth;