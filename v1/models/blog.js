const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const BlogSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    multimedia: {
      type: {
        type: String,
        enum: ["video", "image"],
        default:"image"
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
BlogSchema.plugin(mongoosePaginate);

const Blog = mongoose.model("Blog", BlogSchema);

module.exports = Blog;
