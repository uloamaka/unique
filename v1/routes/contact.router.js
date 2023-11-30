const router = require("express").Router();
const Event = require("../model/contact");
const contactController = require("../controllers/contact.controller");
const paginatedResults = require("../middleware/pagination.middleware");

// Use the pagination middleware for the /contact route
router.get(
  "/contact",
  paginatedResults(Event),
  contactController.getContactRequests
);

router.post("/contact", contactController.createContactRequest);

router.delete("/:id/delete", contactController.deleteContactRequest);

module.exports = router;
