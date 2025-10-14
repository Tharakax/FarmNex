import Notification from "../models/NotificationModel.js";
import { sendNotificationEmail } from '../services/emailService.js';

// Display - Get (all)
const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find();

    if (!notifications || notifications.length === 0) {
      return res.status(404).json({ message: "No notifications found" });
    }

    return res.status(200).json({ notifications });
  } catch (err) {
    console.error("getAllNotifications error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Insert - Post
const addNotifications = async (req, res) => {
  try {
    const { title, body, audience, type, priority, sendEmail } = req.body;

    // Validate required fields (notificationId is now auto-generated)
    if (!title || !body || !audience) {
      return res.status(400).json({ message: "Missing required fields: title, body, audience" });
    }

    // Create notification with auto-generated ID
    const notification = await Notification.create({
      title,
      body,
      audience,
      type: type || 'UPDATE',
      priority: priority || 'MEDIUM',
      sendEmail: sendEmail || false,
    });

    console.log(`📝 Notification created: ${notification.notificationId}`);

    // Send email if requested
    if (sendEmail) {
      try {
        console.log('📧 Sending notification email...');
        const emailResult = await sendNotificationEmail(notification);
        
        // Update notification with email status
        if (emailResult.success) {
          await Notification.findByIdAndUpdate(notification._id, {
            emailSent: true,
            emailSentAt: new Date()
          });
          console.log(`✅ Email sent successfully: ${emailResult.successCount} recipients`);
        } else {
          console.log(`⚠️  Email sending failed: ${emailResult.message}`);
        }
        
        // Include email status in response
        return res.status(201).json({ 
          notification, 
          emailStatus: emailResult 
        });
      } catch (emailError) {
        console.error('❌ Email sending error:', emailError);
        // Don't fail the notification creation if email fails
        return res.status(201).json({ 
          notification, 
          emailStatus: { success: false, message: emailError.message }
        });
      }
    }

    return res.status(201).json({ notification });
  } catch (err) {
    console.error("addNotifications error:", err);

    if (err.code === 11000) {
      return res.status(409).json({ message: "Notification ID conflict (this shouldn't happen with auto-generation)" });
    }

    return res.status(400).json({ message: err.message || "Invalid data" });
  }
};

// Get by id
const getById = async (req, res) => {
  const id = req.params.NotificationId;

  try {
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.status(200).json({ notification });
  } catch (err) {
    console.error("getById error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update - Put
const updateNotification = async (req, res) => {
  const id = req.params.NotificationId;
  const { title, body, audience, type, priority, sendEmail } = req.body;

  try {
    // Validate required fields (notificationId is read-only)
    if (!title || !body || !audience) {
      return res.status(400).json({ message: "Missing required fields: title, body, audience" });
    }

    const updateData = {
      title,
      body,
      audience,
      type: type || 'UPDATE',
      priority: priority || 'MEDIUM',
      sendEmail: sendEmail || false,
    };

    const notification = await Notification.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    console.log(`📝 Notification updated: ${notification.notificationId}`);

    // Send email if requested and not already sent
    if (sendEmail && !notification.emailSent) {
      try {
        console.log('📧 Sending notification email after update...');
        const emailResult = await sendNotificationEmail(notification);
        
        // Update notification with email status
        if (emailResult.success) {
          await Notification.findByIdAndUpdate(notification._id, {
            emailSent: true,
            emailSentAt: new Date()
          });
          console.log(`✅ Email sent successfully: ${emailResult.successCount} recipients`);
        }
        
        return res.status(200).json({ 
          notification, 
          emailStatus: emailResult 
        });
      } catch (emailError) {
        console.error('❌ Email sending error:', emailError);
        return res.status(200).json({ 
          notification, 
          emailStatus: { success: false, message: emailError.message }
        });
      }
    }

    return res.status(200).json({ notification });
  } catch (err) {
    console.error("updateNotification error:", err);
    return res.status(400).json({ message: err.message || "Invalid data" });
  }
};

// Delete - Delete
const deleteNotification = async (req, res) => {
  const id = req.params.NotificationId;

  try {
    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res
      .status(200)
      .json({ message: "Notification deleted successfully", notification });
  } catch (err) {
    console.error("deleteNotification error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get notifications by role/audience
const getNotificationsByRole = async (req, res) => {
  try {
    const { role, audience } = req.params; // 'farmer', 'user', or 'admin' OR direct audience like 'FARMER'
    const targetRole = role || audience?.toLowerCase(); // Support both role and audience params
    
    let audienceFilter;
    if (targetRole === 'farmer' || audience === 'FARMER') {
      audienceFilter = { audience: { $in: ['FARMER', 'BOTH', 'ALL'] } };
    } else if (targetRole === 'admin' || audience === 'ADMIN') {
      audienceFilter = { audience: { $in: ['ADMIN', 'ALL'] } };
    } else if (audience === 'USER') {
      audienceFilter = { audience: { $in: ['USER', 'BOTH', 'ALL'] } };
    } else if (audience === 'ALL') {
      audienceFilter = {}; // Return all notifications
    } else {
      audienceFilter = { audience: { $in: ['USER', 'BOTH', 'ALL'] } };
    }

    const notifications = await Notification.find(audienceFilter)
      .sort({ createdAt: -1 })
      .limit(50); // Limit to recent 50 notifications

    if (!notifications || notifications.length === 0) {
      return res.status(200).json({ notifications: [], message: `No notifications found for ${targetRole || audience}` });
    }

    // Add role-specific metadata
    const enrichedNotifications = notifications.map(notification => ({
      ...notification.toObject(),
      roleSpecific: {
        targetRole: targetRole || audience,
        isRelevant: notification.audience === (targetRole || audience)?.toUpperCase() || notification.audience === 'BOTH' || notification.audience === 'ALL',
        urgencyLevel: notification.priority === 'HIGH' && notification.type === 'ALERT' ? 'critical' : 'normal'
      }
    }));

    return res.status(200).json({ 
      notifications: enrichedNotifications,
      meta: {
        role: targetRole || audience,
        count: enrichedNotifications.length,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error("getNotificationsByRole error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get notification statistics by role
const getNotificationStats = async (req, res) => {
  try {
    const { role } = req.params;
    
    let audienceFilter;
    if (role === 'farmer') {
      audienceFilter = { audience: { $in: ['FARMER', 'BOTH', 'ALL'] } };
    } else if (role === 'admin') {
      audienceFilter = { audience: { $in: ['ADMIN', 'ALL'] } };
    } else {
      audienceFilter = { audience: { $in: ['USER', 'BOTH', 'ALL'] } };
    }

    const [totalCount, recentCount, highPriorityCount, alertCount] = await Promise.all([
      Notification.countDocuments(audienceFilter),
      Notification.countDocuments({ 
        ...audienceFilter, 
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
      }),
      Notification.countDocuments({ ...audienceFilter, priority: 'HIGH' }),
      Notification.countDocuments({ ...audienceFilter, type: 'ALERT' })
    ]);

    return res.status(200).json({
      role,
      stats: {
        total: totalCount,
        recent: recentCount,
        highPriority: highPriorityCount,
        alerts: alertCount,
        offers: await Notification.countDocuments({ ...audienceFilter, type: 'OFFER' }),
        updates: await Notification.countDocuments({ ...audienceFilter, type: 'UPDATE' })
      },
      generatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error("getNotificationStats error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Mark notification as read for a specific user
const markNotificationAsRead = async (req, res) => {
  const id = req.params.NotificationId;
  const { userId } = req.body;

  try {
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Check if user has already read this notification
    const alreadyRead = notification.readBy.some(read => read.userId === userId);
    if (alreadyRead) {
      return res.status(200).json({ 
        message: "Notification already marked as read",
        notification 
      });
    }

    // Add user to readBy array
    notification.readBy.push({ userId, readAt: new Date() });
    await notification.save();

    return res.status(200).json({ 
      message: "Notification marked as read", 
      notification 
    });
  } catch (err) {
    console.error("markNotificationAsRead error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Mark all notifications as read for a user
const markAllNotificationsAsRead = async (req, res) => {
  const { userId, audience } = req.body;

  try {
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Build audience filter
    let audienceFilter = {};
    if (audience && audience !== 'ALL') {
      if (audience === 'FARMER') {
        audienceFilter = { audience: { $in: ['FARMER', 'BOTH', 'ALL'] } };
      } else if (audience === 'USER') {
        audienceFilter = { audience: { $in: ['USER', 'BOTH', 'ALL'] } };
      } else if (audience === 'ADMIN') {
        audienceFilter = { audience: { $in: ['ADMIN', 'ALL'] } };
      }
    }

    // Find all notifications that the user hasn't read yet
    const notifications = await Notification.find({
      ...audienceFilter,
      'readBy.userId': { $ne: userId }
    });

    // Mark all as read
    for (const notification of notifications) {
      notification.readBy.push({ userId, readAt: new Date() });
      await notification.save();
    }

    return res.status(200).json({ 
      message: `${notifications.length} notifications marked as read`,
      count: notifications.length
    });
  } catch (err) {
    console.error("markAllNotificationsAsRead error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get unread count for a user
const getUnreadCount = async (req, res) => {
  try {
    const { userId, audience } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Build audience filter
    let audienceFilter = {};
    if (audience && audience !== 'ALL') {
      if (audience === 'FARMER') {
        audienceFilter = { audience: { $in: ['FARMER', 'BOTH', 'ALL'] } };
      } else if (audience === 'USER') {
        audienceFilter = { audience: { $in: ['USER', 'BOTH', 'ALL'] } };
      } else if (audience === 'ADMIN') {
        audienceFilter = { audience: { $in: ['ADMIN', 'ALL'] } };
      }
    }

    // Count notifications that the user hasn't read
    const unreadCount = await Notification.countDocuments({
      ...audienceFilter,
      'readBy.userId': { $ne: userId }
    });

    return res.status(200).json({ 
      count: unreadCount,
      unreadCount // For backward compatibility
    });
  } catch (err) {
    console.error("getUnreadCount error:", err);
    return res.status(500).json({ message: "Server error", count: 0 });
  }
};

export {
  getAllNotifications,
  addNotifications,
  getById,
  updateNotification,
  deleteNotification,
  getNotificationsByRole,
  getNotificationStats,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
};
