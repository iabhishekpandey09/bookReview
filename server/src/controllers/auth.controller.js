const Review = require("../models/review.model");

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

    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar,
      },
      stats: {
        totalReviews,
        avgRating,
      },
      recentReviews: myReviews.slice(0, 10), 
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { getMe, getProfile };
