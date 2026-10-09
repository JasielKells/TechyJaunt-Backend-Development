const Joi = require('joi');

// Password: min 8 chars, at least one letter and one number (alphanumeric)
const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Name cannot be empty',
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string()
    .pattern(passwordPattern)
    .required()
    .messages({
      'string.pattern.base':
        'Password must be at least 8 characters and contain both letters and numbers',
      'any.required': 'Password is required',
    }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

const verifyEmailSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Verification token is required',
  }),
});

module.exports = { registerSchema, loginSchema, verifyEmailSchema };