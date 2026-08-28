const Joi = require('joi');

const createReviewSchema = Joi.object({
  appointment: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().max(1000).allow('', null)
});

const updateReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5),
  comment: Joi.string().max(1000).allow('', null),
  isApproved: Joi.boolean()
}).min(1);

module.exports = {
  createReviewSchema,
  updateReviewSchema
};
