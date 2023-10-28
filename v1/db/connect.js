const mongoose = require("mongoose");
const localDB = "mongodb://localhost:27017/uniqueDB";

const connectDB = async () => {
  await mongoose
    .connect(localDB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("mongoDB connected successfully!"))
    .catch((err) => console.error("Could not connect to mongoDB", err));
};
// const connectDB = async (url) => {
//   await mongoose
//     .connnect(url, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     })
//     .then(() => console.log("mongoDB connected successfully!"))
//     .catch((err) => console.error("Could not connect to mongoDB", err));
// };

module.exports = connectDB;
