const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("./custom-api");

class unauthenticatedError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.StatusCodes = StatusCodes.UNAUTHORIZED;
  }
}

module.exports = unauthenticatedError;
