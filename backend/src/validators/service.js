const Joi = require('joi');

const createServiceSchema = Joi.object({
  category: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  name: Joi.string().trim().max(100).required(),
  description: Joi.string().max(1000).allow('', null),
  price: Joi.number().min(0).required(),
  duration: Joi.number().min(15).max(480).required(),
  image: Joi.string().allow('', null)
});

const updateServiceSchema = createServiceSchema.fork(['category', 'name', 'price', 'duration'], (schema) => schema.optional());

module.exports = {
  createServiceSchema,
  updateServiceSchema
};
