const router = require("express").Router();
const { multerUploader } = require("../utils/cloudinary");
const Gallery = require("../model/gallery");
const getGallery = require("../middleware/galleryFetch.middleware");
const paginatedResults = require("../middleware/pagination.middleware");
const {
  getGalleryPostById,
  getAllGalleries,
  createGalleryPost,
  deleteGalleryPost,
} = require("../controllers/gallery.controller");

router.get("/", paginatedResults(Gallery), getAllGalleries);

router.post("/upload/", multerUploader.single("image"), createGalleryPost);

router.delete("/:id/delete", deleteGalleryPost);

router.get("/:id/find", getGalleryPostById);

module.exports = router;
