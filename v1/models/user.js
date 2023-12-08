const Mongoose = require("mongoose");

const UserSchema = new Mongoose.Schema(
  {
    username: String,
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      enum: ["admin", "basic"],
      default: "basic",
    },
    authType: {
      type: String,
      enum: ["google", "form"],
      default: "form",
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
  { require: true }
);
const User = Mongoose.model("user", UserSchema)
module.exports = User;
