const express = require("express");
const router = express.Router();

const { adminAuth } = require("../middleware/auth");

const registerUser = require("../controllers/auth");

router.post("/register", registerUser.register);

router.post("/login", registerUser.login);

router.put("/update-role", adminAuth, registerUser.update);

router.delete("/delete-user", adminAuth, registerUser.deleteUser);

// router.post("/forget-password/:id", registerUser.forgotPassword);

// router.post("/reset-password/:token", registerUser.resetPassword);

// //Gooogle auth
// router.get(
//   "/google",
//   registerUser.authenticateGoogle({
//     scope: ["profile", "email"],
//   })
// );
// router.get("/google/callback", registerUser.handleGoogleCallback);

module.exports = router;
