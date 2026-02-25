const express = require("express");
const router = express.Router();
const passport = require("../config/passport");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");
const { getMe, getProfile } = require("../controllers/auth.controller");

router.get("/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);


router.get("/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "http://localhost:5173/login", 
  }),
  (req, res) => {

    const token = jwt.sign(
      { userId: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }       
    );

    res.cookie("token", token, {
      httpOnly: true,            
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.redirect("http://localhost:5173/");
  }
);


router.get("/me", authMiddleware, getMe);


router.get("/profile", authMiddleware, getProfile);


router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

module.exports = router;
