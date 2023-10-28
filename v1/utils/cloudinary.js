require("dotenv").config();
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const multer = require("multer"); // Add multer package

cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.CLOUDAPIKEY,
  api_secret: process.env.CLOUDINARYSECRET,
});

// Create a multer storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "unique_uploads", // Optional folder name in Cloudinary
    allowedFormats: ["jpg", "png"], // Allowed image formats
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb("please upload an image", false);
  }
};

// Create a multer middleware for file uploads
const multerUploader = multer({ storage: storage, fileFilter });

const imageUploader = async (path) => {
  const result = await cloudinary.uploader.upload(path);
  const image = result.url;
  return image;
};

module.exports = { imageUploader, multerUploader };
