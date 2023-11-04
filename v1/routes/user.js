const express = require("express");
const router = express.Router();
const { userAuth } = require("../middleware/auth");
const userController = require("../controllers/user.controller");

router.get("/admin-page", userAuth, userController.getUserPage);
module.exports = router;
