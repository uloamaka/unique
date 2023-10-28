const express = require("express");
const app = express();
const cookieParser =  require("cookie-parser")
const connectDB = require("./db/connect");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const morgan = require("morgan");
const { adminAuth, userAuth } = require("./middleware/auth.js");

require("dotenv").config();
app.set("view engine", "ejs");
// Initialize passport
app.use(passport.initialize());
app.use(cookieParser());
app.use(flash());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());
app.use(
  session({
    secret: "s3Cur3",
    name: "sessionId",
    resave: false,
    saveUninitialized: false,
  })
);
//This line for passport session handling
app.use(passport.session()); 
passport.serializeUser(function(user, cb) {
  cb(null, user);
});
passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

connectDB();
const V1_Router = require("./routes");


app.use("/api/v1", V1_Router);

///////////////////////////////////////////////////////////////////
//google cb
// app.use("/auth", auth);
// // Admin and user routes.

// app.get("/admin", adminAuth, (req, res) => res.send("Admin Route"));
// app.get("/basic", userAuth, (req, res) => res.send("User Route"));
const PORT = 3000 || process.env.PORT


app.listen(3000, () => console.log(`server started at port: ${PORT}`));

