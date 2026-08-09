import Joi from "joi";

export const registerSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required(),
  lastName: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(8).max(128).required(),
  // Accepted but constrained; the controller further restricts what a client
  // may actually self-assign (never "admin").
  role: Joi.string().valid("buyer", "vendor").optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
});

export const resetPasswordSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  token: Joi.string().required(),
  password: Joi.string().min(8).max(128).required(),
});

export const verifyEmailSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  token: Joi.string().required(),
});
