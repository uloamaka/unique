const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const gallerySchema = new mongoose.Schema({
  name: String,
  imageUrl: String, // Store the Cloudinary URL of the uploaded image
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
gallerySchema.plugin(mongoosePaginate);

const Gallery = mongoose.model("Gallery", gallerySchema);
module.exports = Gallery;