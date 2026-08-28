const Joi = require('joi');

const createStaffSchema = Joi.object({
  user: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow(null),
  name: Joi.string().trim().max(100).required(),
  bio: Joi.string().max(1000).allow('', null),
  profileImage: Joi.string().allow('', null),
  specialization: Joi.string().trim().allow('', null),
  experience: Joi.number().min(0).default(0),
  services: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).allow(null),
  workingHours: Joi.array().items(
    Joi.object({
      day: Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday').required(),
      enabled: Joi.boolean().default(true),
      start: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).default('09:00'),
      end: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).default('18:00')
    })
  )
});

const updateStaffSchema = createStaffSchema.fork(['name'], (schema) => schema.optional());

module.exports = {
  createStaffSchema,
  updateStaffSchema
};
