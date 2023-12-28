const Joi = require("joi");

//Input validation using joi.
const contactValidationSchema = Joi.object({
  clientName: Joi.string().min(2).max(50).required(),
  clientEmail: Joi.string().email().min(5).max(255).required(),
  clientPhone: Joi.string().min(10).max(20).required(),
  requestedDate: Joi.date().required(),
  additionalNote: Joi.string().max(1000),
  referralSource: Joi.string().required(),
  estimatedGuestCount: Joi.number().min(1).required(),
  requestedEventType: Joi.string().min(5).max(255).required(),
});

module.exports = {
  contactValidationSchema,
};
