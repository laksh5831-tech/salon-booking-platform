const Joi = require('joi');

const createCategorySchema = Joi.object({
  name: Joi.string().trim().max(50).required(),
  description: Joi.string().max(500).allow('', null),
  image: Joi.string().allow('', null)
});

const updateCategorySchema = Joi.object({
  name: Joi.string().trim().max(50),
  description: Joi.string().max(500).allow('', null),
  image: Joi.string().allow('', null),
  isActive: Joi.boolean()
}).min(1);

module.exports = {
  createCategorySchema,
  updateCategorySchema
};
