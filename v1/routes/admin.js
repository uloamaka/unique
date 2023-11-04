const express = require("express");
const router = express.Router();
const { adminAuth } = require("../middleware/auth");
const adminController = require("../controllers/admin.controller");

router.get("/admin-page", adminAuth, adminController.getAdminPage);

module.exports = router;
