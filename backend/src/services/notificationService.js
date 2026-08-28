const Notification = require('../models/Notification');

class NotificationService {
  async create(userId, title, message, type = 'system', data = {}) {
    if (!userId) return null;

    return Notification.create({
      user: userId,
      title,
      message,
      type,
      data
    });
  }

  async getNotifications(userId, queryParams = {}) {
    const { page = 1, limit = 20, unreadOnly } = queryParams;

    let filter = { user: userId };
    if (unreadOnly === 'true') filter.isRead = false;

    const currentPage = parseInt(page, 10) || 1;
    const currentLimit = Math.min(parseInt(limit, 10) || 20, 50);

    const [total, unread, notifications] = await Promise.all([
      Notification.countDocuments({ user: userId }),
      Notification.countDocuments({ user: userId, isRead: false }),
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * currentLimit)
        .limit(currentLimit)
    ]);

    return {
      notifications,
      unreadCount: unread,
      pagination: {
        total,
        page: currentPage,
        limit: currentLimit,
        pages: Math.ceil(total / currentLimit)
      }
    };
  }

  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({ _id: notificationId, user: userId });
    if (!notification) {
      return null;
    }

    notification.isRead = true;
    await notification.save();
    return notification;
  }

  async markAllAsRead(userId) {
    const result = await Notification.updateMany(
      { user: userId, isRead: false },
      { $set: { isRead: true } }
    );
    return result.modifiedCount;
  }

  async deleteNotification(notificationId, userId) {
    const notification = await Notification.findOneAndDelete({ _id: notificationId, user: userId });
    return !!notification;
  }
}

module.exports = new NotificationService();