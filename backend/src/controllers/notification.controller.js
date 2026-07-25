import Notification from '../models/Notification.model.js';

/**
 * @route   GET /api/v1/notifications
 * @desc    Get user notifications (targeted to user ID or user role)
 * @access  Private
 */
export const getNotifications = async (req, res) => {
  try {
    const userRoleName = req.user.role?.name || '';
    const userId = req.user._id;

    const query = {
      $or: [
        { recipient: userId },
        { targetRole: userRoleName },
      ],
    };

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = notifications.filter(
      (n) => !n.isRead && !n.readBy.includes(userId)
    ).length;

    return res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error) {
    console.error('[Notification Controller Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
};

/**
 * @route   PATCH /api/v1/notifications/:id/read
 * @desc    Mark a specific notification as read
 * @access  Private
 */
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    if (!notification.readBy.includes(req.user._id)) {
      notification.readBy.push(req.user._id);
    }
    notification.isRead = true;
    await notification.save();

    return res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update notification.' });
  }
};

/**
 * @route   PATCH /api/v1/notifications/read-all
 * @desc    Mark all user notifications as read
 * @access  Private
 */
export const markAllAsRead = async (req, res) => {
  try {
    const userRoleName = req.user.role?.name || '';
    const userId = req.user._id;

    const query = {
      $or: [
        { recipient: userId },
        { targetRole: userRoleName },
      ],
    };

    await Notification.updateMany(query, {
      $set: { isRead: true },
      $addToSet: { readBy: userId },
    });

    return res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to mark all as read.' });
  }
};
