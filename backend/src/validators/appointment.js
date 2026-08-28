const Joi = require('joi');

const createAppointmentSchema = Joi.object({
  salon: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  service: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  staff: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow('', null),
  date: Joi.date().iso().required(),
  startTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
  notes: Joi.string().max(500).allow('', null)
});

const updateAppointmentSchema = Joi.object({
  status: Joi.string().valid('pending', 'confirmed', 'completed', 'cancelled', 'no_show'),
  notes: Joi.string().max(500).allow('', null),
  cancellationReason: Joi.string().max(500).allow('', null)
}).min(1);

const cancelAppointmentSchema = Joi.object({
  cancellationReason: Joi.string().max(500).allow('', null)
});

const queryAppointmentsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  status: Joi.string().valid('pending', 'confirmed', 'completed', 'cancelled', 'no_show').allow('', null),
  salon: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow('', null),
  startDate: Joi.date().iso().allow(null),
  endDate: Joi.date().iso().allow(null),
  sort: Joi.string().default('-date')
});

module.exports = {
  createAppointmentSchema,
  updateAppointmentSchema,
  cancelAppointmentSchema,
  queryAppointmentsSchema
};
