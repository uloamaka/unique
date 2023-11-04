const mongoose = require("mongoose");
const BlogSchema = new mongoose.Schema(
  {
    title: String,
    Content: String,
    author: String,
    multimedia: {
      type: {
        type: String,
        enum: ["video", "image"],
      },
      name: {
        type: String,
      },
      imageUrl: String,
      publicId: String,
      description: {
        type: String,
        default: "Photo by cloudinary",
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { required: true }
);

const Blog = mongoose.model("Blog", BlogSchema)

module.exports = Blog;