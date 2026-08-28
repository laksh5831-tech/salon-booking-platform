const authService = require('../services/authService');
const { sendResponse } = require('../utils/response');

exports.register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    sendResponse(res, 201, true, 'Registration successful', result);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    sendResponse(res, 200, true, 'Login successful', result);
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    await authService.logout(req.user._id, req.body?.refreshToken);
    sendResponse(res, 200, true, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    sendResponse(res, 200, true, 'Token refreshed successfully', result);
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user._id);
    sendResponse(res, 200, true, 'User retrieved successfully', user);
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user._id, currentPassword, newPassword);
    sendResponse(res, 200, true, 'Password changed successfully', result);
  } catch (error) {
    next(error);
  }
};
