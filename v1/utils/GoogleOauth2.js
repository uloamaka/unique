require("dotenv").config();
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const passport = require("passport");

const GOOGLE_CLIENT_ID = process.env.CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.CLIENT_SECRET;
const baseUrl = process.env.baseUrl;
// Passport configuration
const passportConfig = new GoogleStrategy(
  {
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    // callbackURL: `${baseUrl}/auth/v1/google/callback`,
    callbackURL: `${baseUrl}auth/google/callback`,
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
