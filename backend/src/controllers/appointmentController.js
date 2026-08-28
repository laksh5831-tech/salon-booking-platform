const appointmentService = require('../services/appointmentService');
const salonService = require('../services/salonService');
const AppError = require('../utils/AppError');
const { sendResponse } = require('../utils/response');

exports.createAppointment = async (req, res, next) => {
  try {
    const appointment = await appointmentService.createAppointment(req.body, req.user._id);
    sendResponse(res, 201, true, 'Appointment booked successfully', appointment);
  } catch (error) {
    next(error);
  }
};

exports.getAppointments = async (req, res, next) => {
  try {
    const result = await appointmentService.getAppointments(
      req.user._id,
      req.user.role,
      req.query
    );
    sendResponse(res, 200, true, 'Appointments retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

exports.getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await appointmentService.getAppointmentById(
      req.params.id,
      req.user._id,
      req.user.role
    );
    sendResponse(res, 200, true, 'Appointment retrieved successfully', appointment);
  } catch (error) {
    next(error);
  }
};

exports.updateAppointment = async (req, res, next) => {
  try {
    const appointment = await appointmentService.updateAppointment(
      req.params.id,
      req.body,
      req.user._id,
      req.user.role
    );
    sendResponse(res, 200, true, 'Appointment updated successfully', appointment);
  } catch (error) {
    next(error);
  }
};

exports.cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await appointmentService.cancelAppointment(
      req.params.id,
      req.body.cancellationReason,
      req.user._id,
      req.user.role
    );
    sendResponse(res, 200, true, 'Appointment cancelled successfully', appointment);
  } catch (error) {
    next(error);
  }
};

exports.getSalonStats = async (req, res, next) => {
  try {
    if (!(await salonService.isSalonAccessible(req.params.salonId, req.user._id, req.user.role))) {
      return next(new AppError('You are not authorized to view this salon\'s stats', 403));
    }

    const stats = await appointmentService.getSalonStats(req.params.salonId);
    sendResponse(res, 200, true, 'Salon stats retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};
