const { StatusCodes, getStatusText } = require("http-status-codes");

// Middleware to get a gallery by id
async function getGallery(req, res, next) {
  let gallery;
  try {
    gallery = await Gallery.findById(req.params.id);
    if (gallery == null) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Gallery not found" });
    }
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message });
  }
  res.gallery = gallery;
  next();
}

module.exports = getGallery;