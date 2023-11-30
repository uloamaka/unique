const Blog = require("../model/blog");
const { imageUploader } = require("../utils/cloudinary");
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
  console.log("Hi!");
  const { error } = validator.blogValidationSchema.validate(req.body);
  if (error) {
    throw new BadRequest(error.message, INVALID_REQUEST_PARAMETERS);
  }
  console.log("Hi!");
  const { title, content } = req.body;
  const { originalname, path } = req.file;
  const result = await imageUploader(path);
  console.log(originalname);
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
    author: req.user.name || "unique.dev", 
  });
  console.log(newBlog)
  const savedBlog = await newBlog.save();
   console.log(savedBlog);
  if (savedBlog == null) {
    throw ServerError("DB error, try again", DATABASE_ERROR);
  }
  return re.created({
    message: "Blog post saved successfully",
    blog_post: savedBlog,
  });
};
const getAllBlogs = async (req, res) => {
  const blogs = await Blog.find({});
  if (!blogs) {
    throw ResourceNotFound(
      "No blog post, Try creating one.",
      RESOURCE_NOT_FOUND
    );
  }
  return res.ok(blogs);
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
  const { error } = validator.blogUpdateValidationSchema.validate(req.body);
  if (error) {
    throw new BadRequest(error.message, INVALID_REQUEST_PARAMETERS);
  }
  const { title } = req.body;
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
  const { error } = validator.blogUpdateValidationSchema.validate(req.body);
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
