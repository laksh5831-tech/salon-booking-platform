const Joi = require('joi');

const createSalonSchema = Joi.object({
  name: Joi.string().trim().max(100).required(),
  description: Joi.string().max(2000).allow('', null),
  address: Joi.string().required(),
  city: Joi.string().trim().required(),
  state: Joi.string().trim().allow('', null),
  country: Joi.string().trim().default('US'),
  postalCode: Joi.string().trim().allow('', null),
  latitude: Joi.number().min(-90).max(90).allow(null),
  longitude: Joi.number().min(-180).max(180).allow(null),
  phone: Joi.string().required(),
  email: Joi.string().email().allow('', null),
  website: Joi.string().uri().allow('', null),
  categories: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).allow(null),
  openingHours: Joi.array().items(
    Joi.object({
      day: Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday').required(),
      enabled: Joi.boolean().default(true),
      open: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).default('09:00'),
      close: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).default('18:00'),
      hasBreak: Joi.boolean().default(false),
      breakStart: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).default('13:00'),
      breakEnd: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).default('14:00')
    })
  ),
  bufferTime: Joi.number().min(0).max(120).default(15)
});

const updateSalonSchema = createSalonSchema.fork(['name', 'address', 'city', 'phone'], (schema) => schema.optional());

const querySalonsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  search: Joi.string().allow('', null),
  city: Joi.string().allow('', null),
  category: Joi.string().allow('', null),
  rating: Joi.number().min(0).max(5).allow(null),
  sort: Joi.string().valid('rating', '-rating', 'name', '-name', 'createdAt', '-createdAt').default('-createdAt'),
  lat: Joi.number().allow(null),
  lng: Joi.number().allow(null),
  maxDistance: Joi.number().allow(null)
});

module.exports = {
  createSalonSchema,
  updateSalonSchema,
  querySalonsSchema
};
