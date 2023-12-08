const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const hbs = require("handlebars");
const fs = require("fs");
const { passport } = require("../utils/GoogleOauth2");
require("dotenv").config();
const { z } = require("zod");
const {
  emailSchema,
  passwordSchema,
  usernameSchema,
} = require("../validators/formRegister.validator");
const jwtSecret = process.env.jwtSecret;
const baseUrl = process.env.baseUrl;
const User = require("../models/user");

const {
  ResourceNotFound,
  BadRequest,
  ServerError,
  Conflict,
  Unauthorized,
} = require("../errors/httpErrors");
const {
  RESOURCE_NOT_FOUND,
  INVALID_REQUEST_PARAMETERS,
  EXISTING_USER_EMAIL,
  EMAIL_ALREADY_VERIFIED,
  MALFORMED_TOKEN,
  EXPIRED_TOKEN,
} = require("../errors/httpErrorCodes");
const validator = require("../validators/formRegister.validator");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const registerUser = async (req, res, next) => {
  const userSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    username: usernameSchema,
  });
  const validUser = userSchema.parse(req.body);
  const { username, email, password } = validUser;
  const userExist = await User.findOne({ email });

  if (userExist) {
    throw new Conflict("Email already exists", EXISTING_USER_EMAIL);
  }
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    email,
    password: hash,
  });

  const maxAge = 1 * 60 * 60;
  const token = jwt.sign({ id: user._id, role: user.role }, jwtSecret, {
    expiresIn: maxAge, // 1hrs in sec
  });
  res.cookie("jwt", token, {
    httpOnly: true,
    maxAge: maxAge * 1000, // 1hrs in ms
  });
  let formattedUser = {
    username,
    email,
    user_id: user._id,
  };
  return res.created({
    message: formattedUser,
  });
};

const loginUser = async (req, res, next) => {
  const userSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
  });

  const validUser = userSchema.parse(req.body);
  const { email, password } = validUser;
  const user = await User.findOne({ email });

  if (!user) {
    throw new ResourceNotFound(
      "No record of this account, sign up now.",
      RESOURCE_NOT_FOUND
    );
  }
  bcrypt.compare(password, user.password, (err, result) => {
    if (err) {
      throw new Error("Error comparing passwords");
    }
    if (result) {
      const maxAge = 3 * 60 * 60;
      const token = jwt.sign({ id: user._id, role: user.role }, jwtSecret, {
        expiresIn: maxAge, // 3hrs in seconds
      });

      res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: maxAge * 1000,
      });
    }
    return res.ok({ message: "Login successful", user: user._id });
  });
};

const updateUserRole = async (req, res, next) => {
  const { role, user_id } = req.body;

  if (!role || !user_id) {
    throw new BadRequest(
      "Provide user_id and role",
      INVALID_REQUEST_PARAMETERS
    );
  }
  const user = await User.findById(user_id);

  if (!user) {
    throw new ResourceNotFound("User does not exist", RESOURCE_NOT_FOUND);
  }
  // Verifying if the user is not already an admin
  if (user.role !== "admin") {
    user.role = role;
    await user.save();
  }
  return res.ok({
    message: "Update successful",
    user_role: user.role,
  });
};
const deleteUser = async (req, res, next) => {
  const { user_id } = req.body;
  const user = await User.findByIdAndDelete(user_id);
  if (!user) {
    throw new ResourceNotFound("User does not exist", RESOURCE_NOT_FOUND);
  }
  return res.noContent();
};
/*  Google AUTH  */
const authenticateGoogle = (strategyOptions) => {
  return passport.authenticate("google", strategyOptions);
};
const handleGoogleCallback = async (req, res, next) => {
  passport.authenticate("google", async (err, user, info) => {
    if (err) {
      throw new ServerError(
        "Authentication failed. Please try again",
        THIRD_PARTY_API_FAILURE
      );
    }
    if (!user) {
      throw new ResourceNotFound(
        "User profile does not exist",
        RESOURCE_NOT_FOUND
      );
    }
    // console.log(info);
    req.login(user, async (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }
      const responseObject = {
        id: user.id,
        email: user.emails[0].value,
        username: user.displayName,
      };

      const signedUser = new User({
        email: responseObject.email,
        password: "",
        role: "basic",
        userName: responseObject.username,
        authType: "google",
      });

      const savedUser = await signedUser.save();
      console.log(savedUser);
      return res.created({
        message: "Authentication successful.",
        user: savedUser,
      });
    });
  })(req, res, next);
};

const emailTemplate = fs.readFileSync("./templates/resetPassword.hbs", "utf-8");
const compiledTemplate = hbs.compile(emailTemplate);
const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new ResourceNotFound("User does not exist", RESOURCE_NOT_FOUND);
  }
  const otpToken = jwtSecret + user.password;
  const resetToken = jwt.sign({ id: user._id, email }, otpToken, {
    expiresIn: "1h",
  });
  let userId = user._id;
  const resetLink = `${baseUrl}api/v1/auth/reset-password/${userId}/${resetToken}`;
  console.log(resetLink);

  const emailContent = compiledTemplate({
    username: user.email,
    resetLink,
  });
  await transporter.sendMail({
    from: "<noreply>unique@outlook.com",
    to: user.email,
    subject: "Password Reset Link",
    html: emailContent,
  });
  return res.ok("Reset link sent successfully");
};

const confirmationTemplate = fs.readFileSync(
  "./templates/confirmationEmail.hbs",
  "utf-8"
);
const compiledConfirmationTemplate = hbs.compile(confirmationTemplate);
const resetPassword = async (req, res) => {
  const { resetToken, userId } = req.params;
  const { newPassword, confirmPassword } = req.body;

  const user = await User.findOne({ _id: userId });
  if (!user) {
    throw new ResourceNotFound("User does not exist", RESOURCE_NOT_FOUND);
  }
  if (!newPassword || !confirmPassword) {
    throw new BadRequest("No password provided", INVALID_REQUEST_PARAMETERS);
  }
  if (newPassword !== confirmPassword) {
    throw new BadRequest(
      "New password and Confirm password must match",
      INVALID_REQUEST_PARAMETERS
    );
  }
  const otpToken = jwtSecret + user.password;
  try {
    decodedToken = jwt.verify(resetToken, otpToken);
  } catch (err) {
    throw new Unauthorized(err.message, MALFORMED_TOKEN);
  }
  const currentTime = Math.floor(Date.now() / 1000);
  //check if the token is still valid
  if (!decodedToken || (decodedToken.exp && decodedToken.exp < currentTime)) {
    throw new Unauthorized("Reset token is expired", EXPIRED_TOKEN);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await User.updateOne(
    { _id: userId },
    { password: hashedPassword },
    {
      new: true,
    }
  );

  await transporter.sendMail({
    from: "<noreply>unique@outlook.com",
    to: user.email,
    subject: "Password Reset Confirmation",
    html: compiledConfirmationTemplate({ username: user.username }),
  });
  return res.ok("Password reset successful");
};

module.exports = {
  registerUser,
  loginUser,
  updateUserRole,
  deleteUser,
  forgotPassword,
  resetPassword,
  authenticateGoogle,
  handleGoogleCallback,
};
