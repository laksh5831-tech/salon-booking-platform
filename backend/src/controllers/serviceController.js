const serviceService = require('../services/serviceService');
const { sendResponse } = require('../utils/response');

exports.getServices = async (req, res, next) => {
  try {
    const result = await serviceService.getServices(req.query);
    sendResponse(res, 200, true, 'Services retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

exports.getServiceById = async (req, res, next) => {
  try {
    const service = await serviceService.getServiceById(req.params.id);
    sendResponse(res, 200, true, 'Service retrieved successfully', service);
  } catch (error) {
    next(error);
  }
};

exports.createService = async (req, res, next) => {
  try {
    const service = await serviceService.createService(
      req.params.salonId,
      req.body,
      req.user._id,
      req.user.role
    );
    sendResponse(res, 201, true, 'Service created successfully', service);
  } catch (error) {
    next(error);
  }
};

exports.updateService = async (req, res, next) => {
  try {
    const service = await serviceService.updateService(
      req.params.id,
      req.body,
      req.user._id,
      req.user.role
    );
    sendResponse(res, 200, true, 'Service updated successfully', service);
  } catch (error) {
    next(error);
  }
};

exports.deleteService = async (req, res, next) => {
  try {
    await serviceService.deleteService(req.params.id, req.user._id, req.user.role);
    sendResponse(res, 200, true, 'Service deleted successfully');
  } catch (error) {
    next(error);
  }
};
