const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const hbs = require("handlebars");
const fs = require("fs");
const { passport } = require("../utils/GoogleOauth2");
require("dotenv").config();
const { z } = require("zod");
const jwtSecret = process.env.jwtSecret;
const User = require("../model/user");

const register = async (req, res, next) => {
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
      email: email,
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

const login = async (req, res, next) => {
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
const update = async (req, res, next) => {
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
// /*  Google AUTH  */
// const authenticateGoogle = (strategyOptions) => {
//   return passport.authenticate("google", strategyOptions);
// };
// const handleGoogleCallback = async (req, res, next) => {
//   passport.authenticate("google", async (err, user, info) => {
//     try {
//       if (err) {
//         // Handle error by sending a message
//         return res
//           .status(StatusCodes.INTERNAL_SERVER_ERROR)
//           .json({ message: "Authentication failed. Please try again." });
//       }
//       if (!user) {
//         // Authentication was successful but no user profile available
//         return res
//           .status(StatusCodes.NOT_FOUND)
//           .json({ message: "Authentication succeeded but no user profile." });
//       }

//       // Authentication successful, you can proceed as needed
//       req.login(user, async (loginErr) => {
//         if (loginErr) {
//           return next(loginErr);
//         }
//         const responseObject = {
//           id: user.id,
//           email: user.emails[0].value,
//           username: user.displayName,
//         };

//         // Create and save a new user based on the responseObject
//         bcrypt
//           .hash(responseObject.email, 10)
//           .then(async (hash) => {
//             const signedUser = new User({
//               email: responseObject.email,
//               username: responseObject.username,
//               password: hash,
//               role: "basic",
//             });

//             try {
//               const savedUser = await signedUser.save();

//               return res.status(StatusCodes.OK).json({
//                 message: "Authentication successful.",
//                 user: responseObject,
//               });
//             } catch (error) {
//               req.flash("error", "Error submitting request: " + error.message);
//               console.error("Error submitting request:", error.message);
//               return res
//                 .status(StatusCodes.BAD_REQUEST)
//                 .json({ message: error.message });
//             }
//           })
//           .catch((hashErr) => {
//             req.flash(
//               "error",
//               "Error generating password hash: " + hashErr.message
//             );
//             console.error("Error generating password hash:", hashErr.message);
//             return res
//               .status(StatusCodes.INTERNAL_SERVER_ERROR)
//               .json({ message: "Internal server error." });
//           });
//       }); // <-- Close the req.login callback
//     } catch (error) {
//       console.error("Error in authentication callback:", error.message);
//       return res
//         .status(StatusCodes.INTERNAL_SERVER_ERROR)
//         .json({ message: "Internal server error." });
//     }
//   })(req, res, next);
// };
// /* FORGET & RESET PASSWORD */
// // const transporter = nodemailer.createTransport({
// //   service: "SendGrid",
// //   auth: {
// //     user: "your_sendgrid_username", // Replace with your SendGrid username
// //     pass: "your_sendgrid_password", // Replace with your SendGrid password
// //   },
// // });
// // Compile the Handlebars template
// const emailTemplate = fs.readFileSync('./templates/resetPassword.hbs', 'utf-8');
// const compiledTemplate = hbs.compile(emailTemplate);
// const forgotPassword = async (req, res, next) => {
//   const { email } = req.body;

//   try {
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res
//         .status(StatusCodes.NOT_FOUND)
//         .json({ message: "User not found" });
//     }

//     // Generate a reset token
//     const resetToken = jwt.sign(
//       { id: user._id, email },
//       jwtSecret,
//       { expiresIn: "1h" } // Token expires in 1 hour
//     );

//     // Construct the reset link
//     const resetLink = `https://your-app-domain.com/reset-password/${resetToken}`;

//     // Send the reset link via email
//     await transporter.sendMail({
//       from: "your-email@example.com",
//       to: user.email, // Assuming you have an email field in your User model
//       subject: "Password Reset",
//       html: compiledTemplate({ username: user.username, resetLink }),
//     });

//     res
//       .status(StatusCodes.OK)
//       .json({ message: "Reset link sent successfully" });
//     console.log(resetLink);
//   } catch (err) {
//     res.status(StatusCodes.BAD_REQUEST).json({
//       message: "Error sending reset link",
//       error: err.message,
//     });
//   }
// };
// Compile the Handlebars template for the confirmation email
// const confirmationTemplate = fs.readFileSync(
//   "./templates/confirmationEmail.hbs",
//   "utf-8"
// );
// const compiledConfirmationTemplate = hbs.compile(confirmationTemplate);

// const resetPassword = async (req, res, next) => {
//   const { resetToken, newPassword } = req.body;

//   try {
//     const decodedToken = jwt.verify(resetToken, jwtSecret);
//     const user = await User.findOne({ _id: decodedToken.id });

//     if (!user) {
//       return res
//         .status(StatusCodes.NOT_FOUND)
//         .json({ message: "User not found" });
//     }

//     // Hash the new password
//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     // Update the user's password
//     await User.updateOne({ _id: user._id }, { password: hashedPassword });

//     // Send confirmation email
//     await transporter.sendMail({
//       from: "your-email@example.com",
//       to: user.email,
//       subject: "Password Reset Confirmation",
//       html: compiledConfirmationTemplate({ username: user.username }),
//     });

//     res.status(StatusCodes.OK).json({ message: "Password reset successful" });
//   } catch (err) {
//     res.status(StatusCodes.BAD_REQUEST).json({
//       message: "Error resetting password",
//       error: err.message,
//     });
//   }
// };

module.exports = {
  register,
  login,
  update,
  deleteUser,
  //   forgotPassword,
  //   resetPassword,
  //   authenticateGoogle,
  //  handleGoogleCallback,
};
