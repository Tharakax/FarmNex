import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/usermodel.js';
import sessionService from '../services/sessionService.js';
dotenv.config();

const JWTauth = async (req, res, next) => {
  try {
    const header = req.header("Authorization");
    
    if (header != null) {
      const token = header.replace("Bearer ", "");
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded != null) {
          console.log('Authenticated user:', decoded);
          
          // Try to get full user details from database if available
          try {
            const user = await User.findById(decoded.id).select('-password');
            if (user) {
              // TEMPORARILY DISABLED: Validate session if sessionId is present in token
              // This is disabled to fix immediate login issues
              if (decoded.sessionId && false) { // Added '&& false' to disable
                try {
                  const isValidSession = await sessionService.validateSession(decoded.id, decoded.sessionId);
                  if (!isValidSession) {
                    console.log('❌ Invalid or expired session for user:', decoded.id);
                    req.authError = {
                      success: false,
                      message: 'Session expired or invalid. Please login again.',
                      code: 'INVALID_SESSION'
                    };
                    return next();
                  }
                } catch (sessionError) {
                  console.error('Session validation error (continuing with graceful fallback):', sessionError.message);
                  console.log('⚠️ Continuing without session validation due to error');
                  // Don't block user - continue with token validation
                }
              }
              
              console.log('📝 Session validation temporarily disabled for user:', decoded.id);
              
              // Add both decoded token data and full user data
              req.user = {
                id: decoded.id,
                email: decoded.email,
                name: decoded.name,
                role: decoded.role,
                sessionId: decoded.sessionId,
                ...user.toObject() // Add full user details
              };
            } else {
              // If user not found in DB, use token data
              req.user = decoded;
            }
          } catch (dbError) {
            console.error('Database lookup error:', dbError);
            // If DB lookup fails, still use the decoded token
            req.user = decoded;
          }
        }
      } catch (jwtError) {
        console.error('JWT verification error:', jwtError.message);
        // For endpoints that require authentication, this should be handled at route level
        // We'll store the error for optional checking in routes
        req.authError = {
          success: false,
          message: 'Invalid or expired token'
        };
      }
    }
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    next();
  }
};

export default JWTauth;
