const jwt = require("jsonwebtoken");
require("dotenv").config();

const { Unauthorized } = require("../errors/httpErrors");
const {
  USER_NOT_VERIFIED,
} = require("../errors/httpErrorCodes");
const jwtSecret = process.env.jwtSecret;

const adminAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (err) {
        throw new Unauthorized(err.message, USER_NOT_VERIFIED);
      } else {
        next();
      }
    });
  } else {
    throw new Unauthorized(
      "Not authorized, token not available",
      USER_NOT_VERIFIED
    );
  }
};

const userAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (err) {
        throw new Unauthorized(err.message, USER_NOT_VERIFIED);
      } else {
        if (decodedToken.role !== "Basic") {
          throw new Unauthorized("Not authorized", USER_NOT_VERIFIED);
        } else {
          next();
        }
      }
    });
  } else {
    throw new Unauthorized(
      "Not authorized, token not available",
      USER_NOT_VERIFIED
    );
  };
};


module.exports = { adminAuth, userAuth }
