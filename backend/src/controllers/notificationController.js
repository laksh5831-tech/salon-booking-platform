const notificationService = require('../services/notificationService');
const { sendResponse } = require('../utils/response');

exports.getNotifications = async (req, res, next) => {
  try {
    const result = await notificationService.getNotifications(req.user._id, req.query);
    sendResponse(res, 200, true, 'Notifications retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user._id);
    if (!notification) {
      return sendResponse(res, 404, false, 'Notification not found');
    }
    sendResponse(res, 200, true, 'Notification marked as read', notification);
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    const count = await notificationService.markAllAsRead(req.user._id);
    sendResponse(res, 200, true, `${count} notification(s) marked as read`, { count });
  } catch (error) {
    next(error);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    const deleted = await notificationService.deleteNotification(req.params.id, req.user._id);
    if (!deleted) {
      return sendResponse(res, 404, false, 'Notification not found');
    }
    sendResponse(res, 200, true, 'Notification deleted successfully');
  } catch (error) {
    next(error);
  }
};