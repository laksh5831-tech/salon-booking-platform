const salonService = require('../services/salonService');
const { sendResponse } = require('../utils/response');

exports.getSalons = async (req, res, next) => {
  try {
    const result = await salonService.getSalons(req.query);
    sendResponse(res, 200, true, 'Salons retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

exports.getSalonById = async (req, res, next) => {
  try {
    const salon = await salonService.getSalonById(req.params.id);
    sendResponse(res, 200, true, 'Salon retrieved successfully', salon);
  } catch (error) {
    next(error);
  }
};

exports.getSalonBySlug = async (req, res, next) => {
  try {
    const salon = await salonService.getSalonBySlug(req.params.slug);
    sendResponse(res, 200, true, 'Salon retrieved successfully', salon);
  } catch (error) {
    next(error);
  }
};

exports.createSalon = async (req, res, next) => {
  try {
    const salon = await salonService.createSalon(req.body, req.user._id);
    sendResponse(res, 201, true, 'Salon created successfully', salon);
  } catch (error) {
    next(error);
  }
};

exports.getMySalon = async (req, res, next) => {
  try {
    const salon = await salonService.getMySalon(req.user._id, req.user.role);
    sendResponse(res, 200, true, 'Salon retrieved successfully', salon);
  } catch (error) {
    next(error);
  }
};

exports.updateSalon = async (req, res, next) => {
  try {
    const salon = await salonService.updateSalon(
      req.params.id,
      req.body,
      req.user._id,
      req.user.role
    );
    sendResponse(res, 200, true, 'Salon updated successfully', salon);
  } catch (error) {
    next(error);
  }
};

exports.deleteSalon = async (req, res, next) => {
  try {
    await salonService.deleteSalon(req.params.id, req.user._id, req.user.role);
    sendResponse(res, 200, true, 'Salon deleted successfully');
  } catch (error) {
    next(error);
  }
};

exports.getSalonServices = async (req, res, next) => {
  try {
    const result = await salonService.getSalonServices(req.params.salonId, req.query);
    sendResponse(res, 200, true, 'Services retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

exports.getSalonStaff = async (req, res, next) => {
  try {
    const result = await salonService.getSalonStaff(req.params.salonId, req.query);
    sendResponse(res, 200, true, 'Staff retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};
