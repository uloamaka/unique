const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 255,         
    unique: false,
    validate: {
      validator: function (v) {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email address!`,
    },
  },
});
const Email = new mongoose.model("email", emailSchema);
module.exports = Email;
