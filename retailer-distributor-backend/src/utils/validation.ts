import Joi from "joi";

// Field rules shared by registration and the profile. The frontend forms
// repeat these limits; change both together.

export const nameSchema = Joi.string().trim().min(2).max(100);

// Digits only, with an optional leading +.
export const phoneSchema = Joi.string()
  .trim()
  .pattern(/^\+?[0-9]{10,15}$/);

// bcrypt ignores everything after 72 bytes.
export const newPasswordSchema = Joi.string().min(8).max(72);

// A retailer's shop name or a distributor's business name.
export const organizationNameSchema = Joi.string().trim().min(2).max(120);

// Optional; an empty value counts as not given.
export const contactInfoSchema = Joi.string().trim().max(200).empty("");

export const locationSchema = Joi.object({
  address: Joi.string().trim().min(5).max(200).required(),
  city: Joi.string().trim().min(2).max(80).required(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
});
