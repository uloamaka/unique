// contact.router.js
const express = require("express");
const router = express.Router();
const Event = require("../model/contact")
const contactController = require("../controllers/contact.controller");
const paginatedResults = require("../middleware/pagination.middleware");

// Use the pagination middleware for the /contact route
router.get("/contact", paginatedResults(Event), contactController.getContactRequests);

router.get("/contact-form", contactController.getContactForm);

router.post("/contact", contactController.createContactRequest);

router.patch("/contact/:id", contactController.updateContactRequest);


module.exports = router;
