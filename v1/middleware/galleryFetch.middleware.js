const Gallery = require("../model/gallery");
const { ResourceNotFound, BadRequest } = require("../errors/httpErrors");
const {
  RESOURCE_NOT_FOUND,
  INVALID_REQUEST_PARAMETERS,
} = require("../errors/httpErrorCodes");

// Middleware to get a gallery by id
async function getGallery(req, res, next) {
  let gallery;
    gallery = await Gallery.findById(req.params.id);
  if (!gallery) {
      throw new ResourceNotFound("Gallery not found", RESOURCE_NOT_FOUND);
    }
  res.gallery = gallery;
  next();
}

module.exports = getGallery;