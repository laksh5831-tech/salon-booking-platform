const Joi = require('joi');

const createStaffLeaveSchema = Joi.object({
  staff: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
  reason: Joi.string().max(500).allow('', null),
  status: Joi.string().valid('pending', 'approved', 'rejected').default('pending')
});

const updateStaffLeaveSchema = Joi.object({
  status: Joi.string().valid('pending', 'approved', 'rejected').required()
});

module.exports = {
  createStaffLeaveSchema,
  updateStaffLeaveSchema
};
