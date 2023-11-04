const Mongoose = require("mongoose");

const UserSchema = new Mongoose.Schema(
  {
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
  },
  { require: true, timestamps: true }
);
const User = Mongoose.model("user", UserSchema)
module.exports = User;
