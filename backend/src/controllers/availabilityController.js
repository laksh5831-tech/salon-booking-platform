const availabilityService = require('../services/availabilityService');
const { sendResponse } = require('../utils/response');

exports.getSalonAvailability = async (req, res, next) => {
  try {
    const { serviceId, staffId, date } = req.query;

    if (!serviceId || !date) {
      return res.status(400).json({
        success: false,
        message: 'serviceId and date are required query parameters'
      });
    }

    const result = await availabilityService.getSalonAvailability(
      req.params.salonId,
      serviceId,
      staffId,
      date
    );
    sendResponse(res, 200, true, 'Availability retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

exports.getStaffAvailability = async (req, res, next) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'date is a required query parameter'
      });
    }

    const result = await availabilityService.getStaffAvailability(req.params.staffId, date);
    sendResponse(res, 200, true, 'Staff availability retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};
