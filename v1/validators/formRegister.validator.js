const { z } = require("zod");
const { BadRequest } = require("../errors/httpErrors");
const {
  RESOURCE_NOT_FOUND,
  INVALID_REQUEST_PARAMETERS,
} = require("../errors/httpErrorCodes");
const emailSchema = z
  .string()
  .refine((value) => {
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
      throw new BadRequest("Invalid email format", INVALID_REQUEST_PARAMETERS);
    }
    return true;
  });
const passwordSchema = z.string().refine((password) => {
  if (password.length < 8) {
    throw new BadRequest(
      "Password must be at least 8 characters long",
      INVALID_REQUEST_PARAMETERS
    );
  }

  if (!/[a-z]/.test(password)) {
    throw new BadRequest(
      "Password must contain at least one lowercase letter",
      INVALID_REQUEST_PARAMETERS
    );
  }
  if (!/[A-Z]/.test(password)) {
    throw new BadRequest(
      "Password must contain at least one uppercase letter",
      INVALID_REQUEST_PARAMETERS
    );
  }
  if (!/\d/.test(password)) {
    throw new BadRequest(
      "Password must contain at least one digit",
      INVALID_REQUEST_PARAMETERS
    );
  }
  if (!/[@$!%*?&]/.test(password)) {
    throw new BadRequest(
      "Password must contain at least one special character (@, $, !, %, *, ?, or &)",
      INVALID_REQUEST_PARAMETERS
    );
  }
  return true;
});

const usernameSchema = z.string().refine((username) => {
  if (username.length < 1){
    throw new BadRequest("username too short", INVALID_REQUEST_PARAMETERS);
  }

  return true;
});

module.exports = {
  emailSchema,
  passwordSchema,
  usernameSchema,
};
