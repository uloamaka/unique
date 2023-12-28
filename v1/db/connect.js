const mongoose = require("mongoose");
const connectDB = async () => {
  try {
    const url = process.env.MONGODB_URL || process.env.Local_DB;

    await mongoose.connect(url, {});

    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Connection error:", error.message);
  }
};

module.exports = connectDB;
