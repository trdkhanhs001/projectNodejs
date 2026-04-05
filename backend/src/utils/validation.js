const Joi = require('joi');

const ValidationSchemas = {
  // ========== AUTH SCHEMAS ==========
  loginSchema: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .required()
      .messages({
        'string.empty': 'Username is required',
        'string.alphanum': 'Username must contain only letters and numbers',
        'string.min': 'Username must be at least 3 characters',
        'string.max': 'Username must not exceed 30 characters'
      }),
    password: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 6 characters'
      })
  }),

  userRegisterSchema: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'string.empty': 'Email is required'
      }),
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .required()
      .messages({
        'string.empty': 'Username is required',
        'string.alphanum': 'Username must contain only letters and numbers',
        'string.min': 'Username must be at least 3 characters',
        'string.max': 'Username must not exceed 30 characters'
      }),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 8 characters',
        'string.pattern.base': 'Password must contain uppercase, lowercase, and numbers'
      }),
    fullName: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.empty': 'Full name is required',
        'string.min': 'Full name must be at least 2 characters',
        'string.max': 'Full name must not exceed 50 characters'
      }),
    phone: Joi.string()
      .pattern(/^[0-9]{10,15}$/)
      .messages({
        'string.pattern.base': 'Phone must be 10-15 digits'
      })
  }),

  refreshTokenSchema: Joi.object({
    refreshToken: Joi.string()
      .required()
      .messages({
        'string.empty': 'Refresh token is required'
      })
  }),

  // ========== MENU SCHEMAS ==========
  createMenuSchema: Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.empty': 'Menu name is required',
        'string.min': 'Menu name must be at least 2 characters',
        'string.max': 'Menu name must not exceed 100 characters'
      }),
    description: Joi.string()
      .max(500)
      .messages({
        'string.max': 'Description must not exceed 500 characters'
      }),
    price: Joi.number()
      .positive()
      .required()
      .messages({
        'number.positive': 'Price must be a positive number',
        'any.required': 'Price is required'
      }),
    category: Joi.string()
      .hex()
      .length(24)
      .required()
      .messages({
        'string.length': 'Invalid category ID',
        'string.empty': 'Category is required'
      }),
    ingredients: Joi.string()
      .max(500)
      .allow('', null),
    preparationTime: Joi.number()
      .positive()
      .messages({
        'number.positive': 'Preparation time must be positive'
      })
  }),

  updateMenuSchema: Joi.object({
    name: Joi.string()
      .min(2)
      .max(100),
    description: Joi.string()
      .max(500)
      .allow('', null),
    price: Joi.number()
      .positive(),
    category: Joi.string()
      .hex()
      .length(24),
    ingredients: Joi.string()
      .max(500)
      .allow('', null),
    preparationTime: Joi.number()
      .positive(),
    isActive: Joi.boolean()
  }).min(1),

  // ========== CATEGORY SCHEMAS ==========
  createCategorySchema: Joi.object({
    name: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.empty': 'Category name is required',
        'string.min': 'Category name must be at least 2 characters',
        'string.max': 'Category name must not exceed 50 characters'
      }),
    description: Joi.string()
      .max(200),
    displayOrder: Joi.number()
      .integer()
      .min(0),
    isActive: Joi.boolean()
  }),

  updateCategorySchema: Joi.object({
    name: Joi.string()
      .min(2)
      .max(50),
    description: Joi.string()
      .max(200)
      .allow('', null),
    displayOrder: Joi.number()
      .integer()
      .min(0),
    isActive: Joi.boolean()
  }).min(1),

  // ========== ORDER SCHEMAS ==========
  createOrderSchema: Joi.object({
    deliveryAddress: Joi.string()
      .min(5)
      .max(200)
      .required()
      .messages({
        'string.empty': 'Delivery address is required',
        'string.min': 'Delivery address must be at least 5 characters'
      }),
    deliveryPhone: Joi.string()
      .pattern(/^[0-9]{10,15}$/)
      .required()
      .messages({
        'string.pattern.base': 'Phone must be 10-15 digits',
        'string.empty': 'Phone number is required'
      }),
    paymentMethod: Joi.string()
      .valid('cash', 'card', 'online')
      .required()
      .messages({
        'any.only': 'Payment method must be: cash, card, or online',
        'string.empty': 'Payment method is required'
      }),
    notes: Joi.string()
      .max(300)
      .allow('', null)
  }),

  createGuestOrderSchema: Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
          menuId: Joi.string().hex().length(24).required(),
          quantity: Joi.number().integer().min(1).required()
        })
      )
      .min(1)
      .required()
      .messages({
        'array.min': 'Order must contain at least one item',
        'any.required': 'Items are required'
      }),
    guestInfo: Joi.object({
      name: Joi.string().max(50),
      email: Joi.string().email(),
      phone: Joi.string()
        .pattern(/^[0-9]{10,15}$/)
        .required()
        .messages({
          'string.pattern.base': 'Phone must be 10-15 digits',
          'string.empty': 'Phone number is required'
        })
    }).required(),
    deliveryAddress: Joi.string()
      .min(5)
      .max(200),
    paymentMethod: Joi.string()
      .valid('cash', 'card', 'online')
      .required(),
    notes: Joi.string()
      .max(300)
      .allow('', null)
  }),

  updateOrderStatusSchema: Joi.object({
    status: Joi.string()
      .valid('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')
      .required()
      .messages({
        'string.empty': 'Status is required',
        'any.only': 'Invalid status value'
      }),
    itemId: Joi.string()
      .hex()
      .length(24)
      .allow(null)
  }),

  // ========== REVIEW SCHEMAS ==========
  createReviewSchema: Joi.object({
    menuId: Joi.string()
      .hex()
      .length(24)
      .required()
      .messages({
        'string.length': 'Invalid menu ID',
        'string.empty': 'Menu ID is required'
      }),
    rating: Joi.number()
      .integer()
      .min(1)
      .max(5)
      .required()
      .messages({
        'number.min': 'Rating must be at least 1',
        'number.max': 'Rating must not exceed 5',
        'any.required': 'Rating is required'
      }),
    comment: Joi.string()
      .min(5)
      .max(500)
      .required()
      .messages({
        'string.empty': 'Comment is required',
        'string.min': 'Comment must be at least 5 characters',
        'string.max': 'Comment must not exceed 500 characters'
      })
  }),

  updateReviewSchema: Joi.object({
    rating: Joi.number()
      .integer()
      .min(1)
      .max(5),
    comment: Joi.string()
      .min(5)
      .max(500)
  }).min(1),

  // ========== USER SCHEMAS ==========
  updateProfileSchema: Joi.object({
    fullName: Joi.string()
      .min(2)
      .max(50),
    email: Joi.string()
      .email(),
    phone: Joi.string()
      .pattern(/^[0-9]{10,15}$/),
    address: Joi.string()
      .max(200)
  }).min(1),

  // ========== DISCOUNT CODE SCHEMAS ==========
  createDiscountCodeSchema: Joi.object({
    code: Joi.string()
      .alphanum()
      .uppercase()
      .min(3)
      .max(20)
      .required()
      .messages({
        'string.empty': 'Code is required',
        'string.alphanum': 'Code must contain only letters and numbers',
        'string.min': 'Code must be at least 3 characters',
        'string.max': 'Code must not exceed 20 characters'
      }),
    description: Joi.string()
      .max(200),
    discountType: Joi.string()
      .valid('percentage', 'fixed')
      .required()
      .messages({
        'any.only': 'Discount type must be: percentage or fixed',
        'string.empty': 'Discount type is required'
      }),
    discountValue: Joi.number()
      .positive()
      .required()
      .messages({
        'number.positive': 'Discount value must be positive',
        'any.required': 'Discount value is required'
      }),
    minOrderAmount: Joi.number()
      .positive()
      .allow(0),
    maxDiscountAmount: Joi.number()
      .positive()
      .allow(null),
    usageLimit: Joi.number()
      .positive()
      .allow(null),
    validFrom: Joi.date()
      .required(),
    validTo: Joi.date()
      .required()
      .min(Joi.ref('validFrom'))
      .messages({
        'date.min': 'Valid to date must be after valid from date'
      })
  }),

  // ========== STAFF SCHEMAS ==========
  createStaffSchema: Joi.object({
    email: Joi.string()
      .email()
      .required(),
    phone: Joi.string()
      .pattern(/^[0-9]{10,15}$/)
      .required(),
    fullName: Joi.string()
      .min(2)
      .max(50)
      .required(),
    position: Joi.string()
      .max(50)
      .required(),
    salary: Joi.number()
      .positive(),
    address: Joi.string()
      .max(200)
  })
};

module.exports = ValidationSchemas;
