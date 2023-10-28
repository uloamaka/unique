const { StatusCodes } = require("http-status-codes");
const Joi = require("joi");
const Event = require("../model/contact");
const handlePaginatedResults = require("../utils/handlePaginatedResult");

//Input validation using joi.
const eventValidationSchema = Joi.object({
  clientName: Joi.string().min(2).max(50).required(),
  clientEmail: Joi.string().email().min(5).max(255).required(),
  clientPhone: Joi.string().min(10).max(20).required(),
  requestedDate: Joi.date().required(),
  additionalNote: Joi.string().max(1000),
  estimatedGuestCount: Joi.number().min(1).required(),
  evenrequestedEventType: Joi.string().min(5).max(255).required(),
});

const getContactForm = async (req, res) => {
  try {
    res.status(StatusCodes.OK).render("contact/form");
  } catch (err) {
    const message = err.message || "Error rendering new contact form";
    req.flash("error", message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).redirect("/");
  }
};
// To be extracted to the admin controller soon....
const getContactRequests = async (req, res) => {
    handlePaginatedResults(res, "CONTACT_REQUEST", async () => {
      const result = await Event.find({});
      res.status(StatusCodes.OK).json({ CONTACT_REQUEST: result });
    }) 
};
const createContactRequest = async (req, res) => {
  try {
    const { error } = eventValidationSchema.validate(req.body);
    if (error) {
      req.flash("error", error.details[0].message);
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: error.details[0].message });
    }
    const event = new Event(req.body);
    const savedEvent = await event.save();
    req.flash(
      "success",
      "Request submitted successfully, our team will get back to you ASAP!"
    );
    return res
      .status(StatusCodes.OK)
      .json({ message: "Request submitted successfully", event: savedEvent });
  } catch (error) {
    req.flash("error", "Error submitting request: " + error.message);
    console.error("Error submitting request:", error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Error submitting request" });
  }
};
const updateContactRequest = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );
    res.status(StatusCodes.OK).json(event);
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err);
  }
};
// To be extracted to the admin controller soon....
const deleteContactRequest = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findByIdAndDelete(eventId);
    if (!event) {
      req.flash("error", "Contact request not found");
      return res.status(StatusCodes.NOT_FOUND).redirect("/");
    }
    req.flash("success", "Contact request deleted successfully");
    res.status(StatusCodes.OK).redirect("/");
  } catch (err) {
    req.flash("error", "Error deleting contact request");
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).redirect("/");
  }
};

module.exports = {
  getContactForm,
  getContactRequests,
  createContactRequest,
  updateContactRequest,
  deleteContactRequest,
};

