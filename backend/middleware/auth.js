import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
export default function JWTauth(req, res, next) {
    const header = req.header("Authorization");
    
    if (header != null) {
        const token = header.replace("Bearer ", "");
        
        jwt.verify(token, process.env.JWT_key, (err, decoded) => {
            if (err) {
                console.error('JWT verification error:', err.message);
                return res.status(401).json({
                    success: false,
                    message: 'Invalid or expired token'
                });
            }
            
            if (decoded != null) {
                console.log('Authenticated user:', decoded);
                req.user = decoded;
                next();
            } else {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication failed'
                });
            }
        });
    } else {
        // For endpoints that don't require authentication, continue
        // For endpoints that do require authentication, this should be handled at route level
        next();
    }
}
