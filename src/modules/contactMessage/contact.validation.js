const Joi = require("joi");

const contactValidationSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters",
  }),

  email: Joi.string().trim().email().optional().messages({
    "string.email": "Please provide a valid email address",
  }),

  phoneNumber: Joi.string().trim().required().messages({
    "string.empty": "Phone number is required",
    "string.pattern.base": "Invalid phone number format",
  }),

  message: Joi.string().trim().min(5).max(1000).required().messages({
    "string.empty": "Message is required",
    "string.min": "Message must be at least 5 characters",
  }),
});

module.exports = contactValidationSchema;
