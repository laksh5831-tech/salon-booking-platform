const adminService = require('../services/adminService');
const { sendResponse } = require('../utils/response');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    sendResponse(res, 200, true, 'Dashboard stats retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const result = await adminService.getUsers(req.query);
    sendResponse(res, 200, true, 'Users retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await adminService.updateUser(req.params.id, req.body);
    sendResponse(res, 200, true, 'User updated successfully', user);
  } catch (error) {
    next(error);
  }
};

exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await adminService.toggleUserStatus(req.params.id);
    sendResponse(res, 200, true, 'User status toggled successfully', user);
  } catch (error) {
    next(error);
  }
};

exports.getAllSalons = async (req, res, next) => {
  try {
    const result = await adminService.getAllSalons(req.query);
    sendResponse(res, 200, true, 'Salons retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

exports.toggleSalonStatus = async (req, res, next) => {
  try {
    const salon = await adminService.toggleSalonStatus(req.params.id);
    sendResponse(res, 200, true, 'Salon status toggled successfully', salon);
  } catch (error) {
    next(error);
  }
};

exports.getAllAppointments = async (req, res, next) => {
  try {
    const result = await adminService.getAllAppointments(req.query);
    sendResponse(res, 200, true, 'Appointments retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

exports.getAllReviews = async (req, res, next) => {
  try {
    const result = await adminService.getAllReviews(req.query);
    sendResponse(res, 200, true, 'Reviews retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

exports.moderateReview = async (req, res, next) => {
  try {
    const review = await adminService.moderateReview(req.params.id, req.body.isApproved);
    sendResponse(res, 200, true, 'Review moderated successfully', review);
  } catch (error) {
    next(error);
  }
};

exports.getAllServices = async (req, res, next) => {
  try {
    const result = await adminService.getServices(req.query);
    sendResponse(res, 200, true, 'Services retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

exports.toggleServiceStatus = async (req, res, next) => {
  try {
    const service = await adminService.toggleServiceStatus(req.params.id);
    sendResponse(res, 200, true, 'Service status toggled successfully', service);
  } catch (error) {
    next(error);
  }
};

exports.getAllCategories = async (req, res, next) => {
  try {
    const result = await adminService.getAllCategories(req.query);
    sendResponse(res, 200, true, 'Categories retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};
