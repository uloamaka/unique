const express = require("express");
const router = express.Router();
const { multerUploader } = require("../utils/cloudinary");
const Gallery = require("../model/gallery")
const getGallery = require("../middleware/galleryFetch.middleware");
const paginatedResults = require("../middleware/pagination.middleware");
const {
  getGalleryPostById,
  getAllGallery,
  getGalleryForm,
  createGalleryPost,
  deleteGalleryPost,
} = require("../controllers/gallery.controller");

// router.get("/:id", getGallery, getGalleryPostById);

router.get("/form", getGalleryForm);

router.get("/", paginatedResults(Gallery), getAllGallery);

router.post("/", multerUploader.single("image"), createGalleryPost);

router.delete("/:id", getGallery, deleteGalleryPost);

module.exports = router;
