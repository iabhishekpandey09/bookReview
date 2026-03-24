// ─────────────────────────────────────────────────────────
//  config/passport.js  ← sets up "Sign in with Google"
//
//  How it works:
//  1. User clicks "Sign in with Google"
//  2. Google sends back their profile info
//  3. We check if they already have an account
//  4. If not, we create one + their default shelves
//  5. We return the user to our auth callback route
// ─────────────────────────────────────────────────────────

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user.model");
const Shelf = require("../models/shelf.model");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback",
    },

    // This function runs after Google approves the login
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const avatar = profile.photos?.[0]?.value || "";
        
        console.log("🔍 Google Profile Debug:", {
          displayName: profile.displayName,
          email: email,
          photos: profile.photos,
          avatar: avatar
        });

        // Check if user already exists in our database
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // First time login → create new user
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: email,
            avatar: avatar,
          });

          

          // Auto-create the 3 default shelves for every new user
          await Shelf.insertMany([
            { userId: user._id, name: "Want to Read", type: "default" },
            { userId: user._id, name: "Currently Reading", type: "default" },
            { userId: user._id, name: "Read", type: "default" },
          ]);

          console.log(`New user created: ${user.name}`);
        } else {
          // Returning user → update avatar in case it changed
          user.avatar = avatar;
          await user.save();
        }

        return done(null, user); // pass user to the callback route
      } catch (error) {
        return done(error, null);
      }
    },
  ),
);

module.exports = passport;
