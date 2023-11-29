const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const hbs = require("handlebars");
const fs = require("fs");
const { passport } = require("../utils/GoogleOauth2");
require("dotenv").config();
const { z } = require("zod");
const jwtSecret = process.env.jwtSecret;
const baseUrl = process.env.baseUrl;
const User = require("../model/user");


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
  const emailSchema = z.string().email("Invalid email format");
  const passwordSchema = z.string().refine((password) => {
    if (password.length < 8) {
      throw new z.ZodError([
        {
          code: "password_too_short",
          message: "Password must be at least 8 characters long",
        },
      ]);
    }
    if (!/[a-z]/.test(password)) {
      throw new z.ZodError([
        {
          code: "missing_lowercase",
          message: "Password must contain at least one lowercase letter",
        },
      ]);
    }
    if (!/[A-Z]/.test(password)) {
      throw new z.ZodError([
        {
          code: "missing_uppercase",
          message: "Password must contain at least one uppercase letter",
        },
      ]);
    }
    if (!/\d/.test(password)) {
      throw new z.ZodError([
        {
          code: "missing_digit",
          message: "Password must contain at least one digit",
        },
      ]);
    }
    if (!/[@$!%*?&]/.test(password)) {
      throw new z.ZodError([
        {
          code: "missing_special_character",
          message:
            "Password must contain at least one special character (@, $, !, %, *, ?, or &)",
        },
      ]);
    }
    return true;
  });

  const userSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
  });

  try {
    const validUser = userSchema.parse(req.body);
    const { email, password } = validUser;
    const userExist = await User.findOne({ email });

    if (userExist) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: 400,
        success: false,
        message: "User already exists, try signing in!",
      });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
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
    res.status(StatusCodes.OK).json({
      status: 200,
      success: true,
      message: "User successfully created",
      user: user._id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues
        .map((issue) => issue.message)
        .join(", ");
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: 400,
        success: false,
        message: errorMessage,
      });
    } else {
      console.error("Error creating contact:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: 500,
        success: false,
        message: error.message,
      });
    }
  }
};

const loginUser = async (req, res, next) => {
  const emailSchema = z.string().email("Invalid email format");
  const passwordSchema = z.string().refine((password) => {
    if (password.length < 1) {
      throw new z.ZodError([
        {
          code: "password_too_short",
          message: "Password must be at least 1 characters long",
        },
      ]);
    }
    return true;
  });

  const userSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
  });
  try {
    const validUser = userSchema.parse(req.body);
    const { email, password } = validUser;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: 401,
        success: false,
        message: "No record of this account, sign up now.",
      });
    }
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          status: 500,
          success: false,
          message: "An error occurred",
        });
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

        return res.status(StatusCodes.OK).json({
          status: 200,
          success: true,
          message: "Login successful",
          user: user._id,
        });
      } else {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          status: 401,
          success: false,
          message: "Wrong email or password provided!",
        });
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues
        .map((issue) => issue.message)
        .join(", ");
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: 400,
        success: false,
        message: errorMessage,
      });
    } else {
      console.error("Error creating contact:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: 500,
        success: false,
        message: error.message,
      });
    }
  }
};
const updateUser = async (req, res, next) => {
  const { role, id } = req.body;

  try {
    if (!role || !id) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Role and user_ID are required." });
    }
    // Finding the user by ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "User not found",
      });
    }
    // Verifying if the user is not already an admin
    if (user.role !== "admin") {
      user.role = role;
      await user.save();
      return res.status(StatusCodes.CREATED).json({
        status: 201,
        success: true,
        message: "Update successful",
        user_role: user.role,
      });
    } else {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "User is already an admin" });
    }
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "An error occurred", error: error.message });
  }
};
const deleteUser = async (req, res, next) => {
  const { id } = req.body;
  try {
    const user = await User.findById(id);

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "User not found" });
    }
    await user.deleteOne();

    return res
      .status(StatusCodes.NO_CONTENT)
      .json({ message: "User successfully deleted", user });
  } catch (error) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "An error occurred", error: error.message });
  }
};
/*  Google AUTH  */
const authenticateGoogle = (strategyOptions) => {
  return passport.authenticate("google", strategyOptions);
};
const handleGoogleCallback = async (req, res, next) => {
  passport.authenticate("google", async (err, user, info) => {
    try {
      if (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          status: 500,
          success: false,
          message: "Authentication failed. Please try again.",
        });
      }
      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({
          status: 404,
          success: false,
          message: "Authentication succeeded but no user profile.",
        });
      }
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
        });

        try {
          const savedUser = await signedUser.save();
          console.log(savedUser);
          return res.status(StatusCodes.OK).json({
            status: 200,
            success: true,
            message: "Authentication successful.",
            // user: savedUser,
          });
        } catch (error) {
          console.error("Error submitting request:", error.message);
          return res.status(StatusCodes.BAD_REQUEST).json({
            status: 400,
            success: false,
            message: error.message,
          });
        }
      });
    } catch (error) {
      console.error("Error in authentication callback:", error.message);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: 500,
        success: false,
        message: "Internal server error.",
      });
    }
  })(req, res, next);
};

const emailTemplate = fs.readFileSync("./templates/resetPassword.hbs", "utf-8");
const compiledTemplate = hbs.compile(emailTemplate);
const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {   
      throw new NotFoundError("User not found");
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
      from: "godsgiftuloamaka235@example.com",
      to: user.email,
      subject: "Password Reset",
      html: emailContent,
    });

    res.status(StatusCodes.OK).json({
      status: 200,
      success: true,
      message: "Reset link sent successfully",
    });
  } catch (err) {
   res.status(err.status || 500).json({
     status: err.status || 500,
     success: false,
     message: "Error resetting password",
     error: err.message,
   });
  }
};

const confirmationTemplate = fs.readFileSync(
  "./templates/confirmationEmail.hbs",
  "utf-8"
);
const compiledConfirmationTemplate = hbs.compile(confirmationTemplate);

const resetPassword = async (req, res) => {
  const { resetToken, userId } = req.params;
  const { newPassword, confirmPassword } = req.body;

  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      throw new NotFoundError("User not found");
    }
    if (!newPassword || !confirmPassword) {
      throw new BadRequestError(
        "please enter your new password and confirm password to proceed"
      );
    }
    if (newPassword !== confirmPassword) {
      throw new BadRequestError("New password and Confirm password must match");
    }
    const otpToken = jwtSecret + user.password;
    const decodedToken = jwt.verify(resetToken, otpToken);
    const currentTime = Math.floor(Date.now() / 1000);
    //check if the token is still valid
    if (decodedToken.exp && decodedToken.exp < currentTime) {
      throw new UnauthenticatedError("Reset token is expired");
    }
   

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.updateOne({ _id: userId }, { password: hashedPassword });

    await transporter.sendMail({
      from: "your-email@example.com",
      to: user.email,
      subject: "Password Reset Confirmation",
      html: compiledConfirmationTemplate({ username: user.email }),
    });

    res.status(StatusCodes.OK).json({
      status: 200,
      success: true,
      message: "Password reset successful",
    });
  } catch (err) {
    res.status(err.status || 500).json({
      status: err.status || 500,
      success: false,
      message: "Error resetting password",
      error: err.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateUser,
  deleteUser,
  forgotPassword,
  resetPassword,
  authenticateGoogle,
  handleGoogleCallback,
};
