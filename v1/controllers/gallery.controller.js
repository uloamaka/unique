const Gallery = require("../model/gallery");
const { imageUploader } = require("../utils/cloudinary");
const { ResourceNotFound, BadRequest } = require("../errors/httpErrors");
const {
  RESOURCE_NOT_FOUND,
  INVALID_REQUEST_PARAMETERS,
} = require("../errors/httpErrorCodes");

const createGalleryPost = async (req, res) => {
  if (!req.file) {
    throw new BadRequest("No Picture selected!", INVALID_REQUEST_PARAMETERS);
  }
  const { originalname, path } = req.file;
  const result = await imageUploader(path);
  const newGalleryPost = new Gallery({
    name: originalname,
    imageUrl: result,
  });

  const savedPost = await newGalleryPost.save();
  return res.created({
    message: "Gallery post created successfully.",
    post: savedPost,
  });
};
const getAllGalleries = async (req, res) => {
  const galleries = await Gallery.find();
  if (!galleries) {
    throw new ResourceNotFound("No Gallery Post!", RESOURCE_NOT_FOUND);
  }
  return res.ok(galleries);
};

const getGalleryPostById = async (req, res) => {
  const post_id = req.params.id;
  if (!post_id) {
    throw new BadRequest("No post ID provided!", INVALID_REQUEST_PARAMETERS);
  }
  const galleryPost = await Gallery.findById(post_id);
  console.log(galleryPost);
  if (!galleryPost) {
    throw new ResourceNotFound(
      `The post with Id:${post_id} Not Found`,
      RESOURCE_NOT_FOUND
    );
  }

  return res.ok(galleryPost);
};
const deleteGalleryPost = async (req, res) => {
  const post_id = req.params.id;

  if (!post_id) {
    throw new BadRequest("No post ID provided!", INVALID_REQUEST_PARAMETERS);
  }
  galleryPost = await Gallery.findByIdAndDelete(post_id);
  if (!galleryPost) {
    throw new ResourceNotFound(
      `The post with Id:${post_id} Not Found`,
      RESOURCE_NOT_FOUND
    );
  }
  return res.noContent({});
};

module.exports = {
  getAllGalleries,
  createGalleryPost,
  getGalleryPostById,
  deleteGalleryPost,
};
