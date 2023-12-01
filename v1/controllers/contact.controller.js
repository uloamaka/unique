const Event = require("../model/contact");
const handlePaginatedResults = require("../utils/handlePaginatedResult");
const { ResourceNotFound, BadRequest } = require("../errors/httpErrors");
const {
  RESOURCE_NOT_FOUND,
  INVALID_REQUEST_PARAMETERS,
} = require("../errors/httpErrorCodes");
const validator = require("../validator/contact.validator");

const createContactRequest = async (req, res) => {
  const { error } = validator.eventValidationSchema.validate(req.body);
  if (error) {
    throw new BadRequest(error.message, INVALID_REQUEST_PARAMETERS);
  }
  const event = new Event(req.body);
  const savedEvent = await event.save();

  return res.created({
    message: "Request submitted successfully",
    event: savedEvent,
  });
};

// To be extracted to the admin controller soon....
const getContactRequests = async (req, res) => {
  handlePaginatedResults(res, "CONTACT_REQUEST", async () => {
    const result = await Event.find({});
    return res.ok({
      result,
    });
  });
};

// To be extracted to the admin controller soon....
const deleteContactRequest = async (req, res) => {
  const eventId = req.params.id;
  const event = await Event.findByIdAndDelete(eventId);
  if (!event) {
    throw new ResourceNotFound(
      `The contact with the id:${eventId} not found`,
      RESOURCE_NOT_FOUND
    );
  }
  return res.noContent({});
};

module.exports = {
  getContactRequests,
  createContactRequest,
  deleteContactRequest,
};
