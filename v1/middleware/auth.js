const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtSecret = process.env.jwtSecret;

const adminAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (err) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({
            message: "Not authorized"
      , error: err.message  });
      } else {
        next();
      }
    });
  } else {3
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: " Not authorized, token not available" });
  }
};

const userAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (err) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: "Not authorized" });
      } else {
        if (decodedToken.role !== "Basic") {
          return res
            .status(StatusCodes.UNAUTHORIZED)
            .json({ message: "Not authorized" });
        } else {
          next();
        }
      }
    });
  } else {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Not authorized, token not available" });
  }
};

module.exports = { adminAuth, userAuth };
