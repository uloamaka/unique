const Mongoose = require("mongoose");

const UserSchema = new Mongoose.Schema(
  {
    userName: String,
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
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { require: true}
);
const User = Mongoose.model("user", UserSchema)
module.exports = User;
