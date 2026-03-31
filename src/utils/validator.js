const Joi = require('joi');

// Auth validation schemas
const authSchemas = {
  login: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).required()
  }),
  
  changePassword: Joi.object({
    currentPassword: Joi.string().min(6).required(),
    newPassword: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
  })
};

// Staff validation schemas
const staffSchemas = {
  create: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    fullName: Joi.string().min(2).max(100).required(),
    phone: Joi.string().pattern(/^[0-9]{10,11}$/).required()
  }),
  
  update: Joi.object({
    email: Joi.string().email(),
    fullName: Joi.string().min(2).max(100),
    phone: Joi.string().pattern(/^[0-9]{10,11}$/),
    status: Joi.string().valid('active', 'inactive')
  }).min(1),
  
  updatePassword: Joi.object({
    newPassword: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
  })
};

// Menu validation schemas
const menuSchemas = {
  create: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(5).max(500).required(),
    ingredients: Joi.string().min(3).max(500).required(),
    price: Joi.number().positive().required()
  }),
  
  update: Joi.object({
    name: Joi.string().min(3).max(100),
    description: Joi.string().min(5).max(500),
    ingredients: Joi.string().min(3).max(500),
    price: Joi.number().positive(),
    status: Joi.string().valid('active', 'inactive')
  }).min(1)
};

// Order validation schemas
const orderSchemas = {
  create: Joi.object({
    items: Joi.array().items(
      Joi.object({
        menuId: Joi.string().required(),
        quantity: Joi.number().positive().integer().required()
      })
    ).min(1).required(),
    tableNumber: Joi.number().positive().integer(),
    notes: Joi.string().max(500)
  }),
  
  updateStatus: Joi.object({
    status: Joi.string().valid('pending', 'preparing', 'ready', 'served', 'cancelled').required()
  })
};

/**
 * Validate request data
 * @param {object} data - Data to validate
 * @param {object} schema - Joi schema
 * @returns {object} - { error, value }
 */
const validate = (data, schema) => {
  return schema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
};

module.exports = {
  validate,
  authSchemas,
  staffSchemas,
  menuSchemas,
  orderSchemas
};
