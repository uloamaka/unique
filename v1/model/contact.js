const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const eventSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      minlength: 2,
      maxlength: 50,
    },
    clientEmail: {
      type: String,
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
    clientPhone: {
      type: String,
      validate: {
        validator: function (v) {
          // Use a regular expression to validate phone number format
          return /^\d{11}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    requestedEventType: {
      type: String,
      enum: ["wedding", "birthday", "corporate", "other"],
      default: "other",
    },
    estimatedGuestCount: {
      type: Number,
      min: 1,
      max: 1000000,
    },
    requestedDate: String,
    howYouHeardAboutUs: {
      type: String,
      enum: ["social media", "referral", "google","venue report", "other"],
      default: "other",
    },
    additionalNote: {
      type: String,
      maxlength: 1000,
      default: "None",
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
eventSchema.plugin(mongoosePaginate);

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;