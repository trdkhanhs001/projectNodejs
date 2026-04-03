/**
 * Joi Validation Middleware
 * Validates request body against Joi schemas
 */

const validateRequest = (schemaName) => {
  return (req, res, next) => {
    const ValidationSchemas = require('../utils/validation');
    const schema = ValidationSchemas[schemaName];

    if (!schema) {
      return res.status(500).json({
        error: {
          message: 'Validation schema not found',
          status: 500
        }
      });
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      presence: 'required'
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      }));

      return res.status(400).json({
        error: {
          message: 'Validation failed',
          status: 400,
          details
        }
      });
    }

    // Replace body with validated value (removes unknown fields)
    req.body = value;
    next();
  };
};

module.exports = { validateRequest };
