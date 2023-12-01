const Blog = require("../model/blog");
const { imageUploader } = require("../utils/cloudinary");
const handlePaginatedResults = require("../utils/handlePaginatedResult");
const {
  ResourceNotFound,
  BadRequest,
  ServerError,
} = require("../errors/httpErrors");
const {
  DATABASE_ERROR,
  RESOURCE_NOT_FOUND,
  INVALID_REQUEST_PARAMETERS,
} = require("../errors/httpErrorCodes");
const validator = require("../validator/blogPost.validator");

const createBlogPost = async (req, res) => {
  const { error } = validator.blogValidationSchema.validate(req.body);
  if (error) {
    throw new BadRequest(error.message, INVALID_REQUEST_PARAMETERS);
  }
  const { title, content } = req.body;
  const { originalname, path } = req.file;
  const result = await imageUploader(path);
  console.log(result);
  const newBlog = new Blog({
    title,
    content,
    multimedia: {
      type: "image",
      name: originalname,
      imageUrl: result.secure_url,
      publicId: result.public_id,
    },
    author: "unique.dev",
  });
  const savedBlog = await newBlog.save();
  if (savedBlog == null) {
    throw ServerError("DB error, try again", DATABASE_ERROR);
  }
  return res.created({
    message: "Blog post saved successfully",
    Blog_post: savedBlog,
  });
};
const getAllBlogs = async (req, res) => {
  handlePaginatedResults(res, "Blog_posts", async () => {
    const blogs = await Blog.find({});
    if (!blogs) {
      throw ResourceNotFound(
        "No blog post, Try creating one.",
        RESOURCE_NOT_FOUND
      );
    }
    return res.ok(
      blogs,
    );
  });
};
const getABlogById = async (req, res) => {
  let blogId = req.params.id;
  if (!blogId) {
    throw new BadRequest("PostId not provided", INVALID_REQUEST_PARAMETERS);
  }
  const blog = await Blog.findById(blogId);
  if (!blog) {
    throw ResourceNotFound("Blog post not found", RESOURCE_NOT_FOUND);
  }
  return res.ok(blog);
};
const updateBlogTitle = async (req, res) => {
  const { title } = req.body;
  const { error } = validator.blogTitleValidationSchema.validate(req.body);
  if (error) {
    throw new BadRequest(error.message, INVALID_REQUEST_PARAMETERS);
  }

  const updatedField = await Blog.findByIdAndUpdate(
    { _id: req.params.id },
    { title, updatedAt: Date.now() },
    {
      new: true,
    }
  );
  if (!updatedField) {
    throw new ResourceNotFound("Blog post not found", RESOURCE_NOT_FOUND);
  }
  return res.ok(updatedField);
};

const updateBlogContent = async (req, res) => {
  const { error } = validator.blogContentValidationSchema.validate(req.body);
  if (error) {
    throw new BadRequest(error.message, INVALID_REQUEST_PARAMETERS);
  }
  const { content } = req.body;
  const updatedField = await Blog.findByIdAndUpdate(
    { _id: req.params.id },
    { content, updatedAt: Date.now() },
    {
      new: true,
    }
  );
  if (!updatedField) {
    throw new ResourceNotFound("Blog post not found", RESOURCE_NOT_FOUND);
  }
  return res.ok(updatedField);
};
const deleteBlogPost = async (req, res) => {
  const blogId = req.params.id;
  const blog = await Blog.findByIdAndDelete(blogId);
  if (!blog) {
    throw new ResourceNotFound("Blog post not found", RESOURCE_NOT_FOUND);
  }
  return res.noContent({});
};

module.exports = {
  createBlogPost,
  getAllBlogs,
  getABlogById,
  updateBlogTitle,
  updateBlogContent,
  deleteBlogPost,
};
