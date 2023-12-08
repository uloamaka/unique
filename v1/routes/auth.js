const router = require("express").Router();
const { adminAuth } = require("../middlewares/auth");

const registerUser = require("../controllers/auth");

router.post("/register", registerUser.registerUser);

router.post("/login", registerUser.loginUser);

router.patch("/update-role", adminAuth, registerUser.updateUserRole);

router.delete("/delete-user", adminAuth, registerUser.deleteUser);

router.post("/forget-password", registerUser.forgotPassword);

router.post("/reset-password/:userId/:resetToken", registerUser.resetPassword);

//Gooogle auth
router.get(
  "/google",
  registerUser.authenticateGoogle({
    scope: ["profile", "email"],
  })
);
router.get("/google/callback", registerUser.handleGoogleCallback);

module.exports = router;
