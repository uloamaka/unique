const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const gallerySchema = new mongoose.Schema(
  {
    imageName: String,
    imageUrl: String,
    category: {
      type: String,
      enum: ["ceremonies", "receptions", "corporate", "party"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { require: true }
);
gallerySchema.plugin(mongoosePaginate);

const Gallery = mongoose.model("Gallery", gallerySchema);
module.exports = Gallery;
