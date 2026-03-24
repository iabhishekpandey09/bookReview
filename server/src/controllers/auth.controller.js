const Review = require("../models/review.model");
const User = require("../models/user.model");
const axios = require("axios");

const getMe = async (req, res) => {
  try {
    const { _id, name, email, avatar } = req.user;
    res.json({ id: _id, name, email, avatar });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const myReviews = await Review
      .find({ userId })
      .populate("bookId", "title author coverImage") 
      .sort({ createdAt: -1 });

    const totalReviews = myReviews.length;
    let avgRating = "0";

    if (totalReviews > 0) {
      let sum = 0;

      for (let i = 0; i < myReviews.length; i++) {
        sum = sum + myReviews[i].rating;
      }

      let average = sum / totalReviews;

      avgRating = average.toFixed(1);
    }
    
    // Return avatar URL via backend endpoint
    const avatarUrl = req.user.avatar ? `/auth/avatar/${req.user._id}` : "";

    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatar: avatarUrl,
      },
      stats: {
        totalReviews,
        avgRating,
      },
      recentReviews: myReviews.slice(0, 10), 
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getAvatar = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user || !user.avatar) {
      return res.status(404).json({ message: "Avatar not found" });
    }
    
    // Fetch the Google avatar image and serve it
    const response = await axios.get(user.avatar, {
      responseType: "arraybuffer",
      timeout: 5000,
    });
    
    res.set("Content-Type", response.headers["content-type"]);
    res.set("Cache-Control", "public, max-age=86400"); // Cache for 24 hours
    res.send(response.data);
  } catch (error) {
    console.error("Avatar fetch error:", error.message);
    res.status(500).json({ message: "Failed to load avatar" });
  }
};

module.exports = { getMe, getProfile, getAvatar };
