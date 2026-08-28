const staffService = require('../services/staffService');
const { sendResponse } = require('../utils/response');

exports.getStaffBySalon = async (req, res, next) => {
  try {
    const result = await staffService.getStaffBySalon(req.params.salonId, req.query);
    sendResponse(res, 200, true, 'Staff retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

exports.getStaffById = async (req, res, next) => {
  try {
    const staff = await staffService.getStaffById(req.params.id);
    sendResponse(res, 200, true, 'Staff member retrieved successfully', staff);
  } catch (error) {
    next(error);
  }
};

exports.createStaff = async (req, res, next) => {
  try {
    const staff = await staffService.createStaff(
      req.params.salonId,
      req.body,
      req.user._id,
      req.user.role
    );
    sendResponse(res, 201, true, 'Staff member added successfully', staff);
  } catch (error) {
    next(error);
  }
};

exports.updateStaff = async (req, res, next) => {
  try {
    const staff = await staffService.updateStaff(
      req.params.id,
      req.body,
      req.user._id,
      req.user.role
    );
    sendResponse(res, 200, true, 'Staff member updated successfully', staff);
  } catch (error) {
    next(error);
  }
};

exports.deleteStaff = async (req, res, next) => {
  try {
    await staffService.deleteStaff(req.params.id, req.user._id, req.user.role);
    sendResponse(res, 200, true, 'Staff member removed successfully');
  } catch (error) {
    next(error);
  }
};

exports.createStaffLeave = async (req, res, next) => {
  try {
    const leave = await staffService.createStaffLeave(
      req.params.salonId,
      req.body,
      req.user._id,
      req.user.role
    );
    sendResponse(res, 201, true, 'Staff leave created successfully', leave);
  } catch (error) {
    next(error);
  }
};

exports.getStaffLeaves = async (req, res, next) => {
  try {
    const result = await staffService.getStaffLeaves(req.params.salonId, req.query);
    sendResponse(res, 200, true, 'Staff leaves retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

exports.updateStaffLeave = async (req, res, next) => {
  try {
    const leave = await staffService.updateStaffLeave(
      req.params.id,
      req.body,
      req.user._id,
      req.user.role
    );
    sendResponse(res, 200, true, 'Staff leave updated successfully', leave);
  } catch (error) {
    next(error);
  }
};
