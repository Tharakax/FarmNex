import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
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
