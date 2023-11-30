const Joi = require("joi");

//Input validation using joi.
const blogValidationSchema = Joi.object({
  title: Joi.string().min(1).max(50).required(),
  content: Joi.string().min(2).max(255).required(),
});



module.exports = {
  blogValidationSchema,
};
 