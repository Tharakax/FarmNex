# FarmNex Session Management System

## Overview

This system implements **single-login enforcement** for the FarmNex application, ensuring that when a farmer logs into their dashboard, other farmers cannot access it simultaneously. Each user can only have one active session at a time.

## How It Works

### 1. **Single Session Per User**
- When a user logs in, any existing session for that user is automatically invalidated
- Only the most recent login session remains active
- If someone tries to use an old session, they'll be logged out automatically

### 2. **Session Tracking**
- Each login creates a unique session ID stored in the database
- Session includes login time, last activity, IP address, and user agent
- Sessions automatically expire after 24 hours of inactivity

### 3. **Real-time Session Validation**
- Frontend checks session validity every 5 minutes
- Invalid or expired sessions trigger automatic logout
- Users are redirected to login page if their session becomes invalid

## Key Features

### 🔒 **Security Features**
- **Single Login Enforcement**: Only one active session per user
- **Automatic Session Invalidation**: Old sessions are cleared when new login occurs
- **Session Expiration**: Sessions expire after 24 hours
- **Real-time Validation**: Periodic checks ensure session validity

### 👨‍💼 **Admin Controls**
- **View Active Sessions**: Admins can see all currently active user sessions
- **Force Logout**: Admins can terminate any user's session
- **Session Cleanup**: Admins can clean up expired sessions

### 🔄 **Automatic Management**
- **Activity Tracking**: Updates last activity timestamp on user interaction
- **Graceful Logout**: Proper cleanup when users logout normally
- **Network Error Handling**: Handles network issues during session checks

## API Endpoints

### User Session Management
```
POST   /users/logout                    # User logout
GET    /users/session/status           # Check current session status
```

### Admin Session Management (Admin Only)
```
GET    /users/admin/active-sessions    # Get all active sessions
POST   /users/admin/force-logout/:userId  # Force logout specific user
POST   /users/admin/cleanup-sessions   # Clean up expired sessions
```

## Database Schema Changes

### User Model Updates
```javascript
currentSession: {
  sessionId: String,      // Unique session identifier
  loginTime: Date,        // When session was created
  lastActivity: Date,     // Last user activity
  ipAddress: String,      // Client IP address
  userAgent: String       // Client browser/device info
}
```

## Frontend Components

### 1. **Session Manager** (`src/utils/sessionManager.js`)
- Handles session monitoring and validation
- Manages automatic logout on session expiry
- Tracks user activity and handles network errors

### 2. **Updated Dashboards**
- **Farmer Dashboard**: Starts session monitoring on load
- **Admin Dashboard**: Starts session monitoring on load
- **Automatic Cleanup**: Stops monitoring when dashboard unmounts

### 3. **Enhanced Auth Utils** (`src/utils/authUtils.js`)
- Updated to work with new session system
- Maintains backward compatibility

## Usage Examples

### Starting Session Monitoring (Frontend)
```javascript
import sessionManager from '../utils/sessionManager';

// In a React component
useEffect(() => {
  // Start monitoring when component mounts
  sessionManager.startSessionMonitoring();
  
  return () => {
    // Stop monitoring when component unmounts
    sessionManager.stopSessionMonitoring();
  };
}, []);
```

### Manual Logout (Frontend)
```javascript
import sessionManager from '../utils/sessionManager';

const handleLogout = async () => {
  await sessionManager.logout();
  // User will be redirected to login page
};
```

### Admin: View Active Sessions (Backend)
```javascript
GET /users/admin/active-sessions

Response:
{
  "success": true,
  "sessions": [
    {
      "userId": "64f123...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "FarmStaff",
      "sessionId": "abc123...",
      "loginTime": "2024-12-26T10:00:00Z",
      "lastActivity": "2024-12-26T10:30:00Z",
      "ipAddress": "192.168.1.100"
    }
  ],
  "totalActiveSessions": 1
}
```

### Admin: Force Logout User (Backend)
```javascript
POST /users/admin/force-logout/64f123...

Response:
{
  "success": true,
  "message": "User session terminated successfully"
}
```

## Configuration

### Session Settings
- **Session Duration**: 24 hours (configurable in `sessionService.js`)
- **Check Interval**: 5 minutes (configurable in `sessionManager.js`)
- **Activity Threshold**: 30 minutes (configurable in `sessionManager.js`)

### Environment Variables
Make sure these are set in your `.env` file:
```
JWT_SECRET=your-jwt-secret-key
MONGO_URL=your-mongodb-connection-string
```

## Security Considerations

### ✅ **What's Protected**
- Multiple concurrent logins are prevented
- Sessions are validated server-side
- Expired sessions are automatically cleaned up
- Admin-only session management functions

### ⚠️ **Important Notes**
- Sessions are stored in the database, not just JWT tokens
- Each login invalidates previous sessions for that user
- Network issues won't immediately log users out (graceful handling)
- Admins cannot force-logout their own sessions

## Testing the System

### 1. **Single Login Test**
1. Login as a farmer in one browser
2. Try to login as the same farmer in another browser
3. The first session should be invalidated

### 2. **Session Expiry Test**
1. Login as a user
2. Wait for session to expire (or manually set short expiry)
3. Try to access protected resources
4. Should be redirected to login

### 3. **Admin Controls Test**
1. Login as admin
2. Check active sessions: `GET /users/admin/active-sessions`
3. Force logout a user: `POST /users/admin/force-logout/:userId`
4. Verify user is logged out

## Troubleshooting

### Common Issues

#### Users Can't Login
- Check database connection
- Verify JWT_SECRET is set
- Check session service is working

#### Sessions Not Being Cleared
- Check `sessionService.cleanupExpiredSessions()` function
- Verify database permissions
- Check MongoDB query indexes

#### Frontend Not Redirecting
- Check `sessionManager.js` is imported correctly
- Verify axios interceptors are working
- Check browser console for errors

### Debug Commands

```bash
# Check active sessions in database
db.usermodels.find({"currentSession.sessionId": {$ne: null}})

# Clear all sessions (emergency)
db.usermodels.updateMany({}, {$set: {"currentSession": {}}})
```

## Benefits

1. **Security**: Prevents unauthorized concurrent access
2. **User Experience**: Clear feedback when sessions expire
3. **Admin Control**: Full visibility and control over user sessions
4. **Scalability**: Efficient session management for multiple users
5. **Reliability**: Graceful handling of network issues and edge cases

---

*This session management system ensures that farmers can work individually in their dashboards without interference from other users, providing both security and a better user experience.*