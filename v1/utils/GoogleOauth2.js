require("dotenv").config();
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const passport = require("passport");

const GOOGLE_CLIENT_ID = process.env.CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.CLIENT_SECRET;

// Passport configuration
const passportConfig = new GoogleStrategy(
  {
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback",
  },
  (accessToken, refreshToken, profile, done) => {
    userProfile = profile;
    return done(null, userProfile);
  }
);

// Initialize passport and use the strategy
passport.use(passportConfig);

module.exports = {
  passport,
};
