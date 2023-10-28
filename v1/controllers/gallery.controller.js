const { StatusCodes } = require("http-status-codes");
const Gallery = require("../model/gallery"); // importing the gallery model
const { imageUploader } = require("../utils/cloudinary");

const getGalleryForm = async (req, res) => {
  try {
    res.render("gallery")
      // json("This will be the form page to post a picture ");
  } catch (err) {
    const message = err.message || "Error rendering new galliery form";
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message });
  }
};
const getAllGallery = async (req, res) => {
  try {
    const galleries = await Gallery.find();
    res.status(StatusCodes.OK).json(galleries);
  } catch (err) {
    res.status(StatusCodes.NOT_FOUND).json({ message: err.message });
  }
};
const createGalleryPost = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No photo provided." });
    }
    const { originalname, path } = req.file;
    const result = await imageUploader(path);
    console.log(result)
    // Create a new gallery post in your database
    const newGalleryPost = new Gallery({
      name: originalname,
      imageUrl: result
    });

    const savedPost = await newGalleryPost.save();
    return res
      .status(StatusCodes.OK)
      .json({ message: "Gallery post created successfully.", post: savedPost });
  } catch (error) {
    console.error("Error creating gallery post:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error." });
  }
};
const getGalleryPostById = async (req, res) => {
  try {
    await res.status(StatusCodes.OK).json({ gallery: res.gallery });
  } catch (err) {
    res.status(StatusCodes.NOT_FOUND).json({ message: err.message });
  }
};
const deleteGalleryPost = async (req, res) => {
  try {
    await res.gallery.deleteOne();
    res.json({ message: "Gallery deleted" });
  } catch {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getGalleryForm,
  getAllGallery,
  createGalleryPost,
  getGalleryPostById,
  deleteGalleryPost,
};
