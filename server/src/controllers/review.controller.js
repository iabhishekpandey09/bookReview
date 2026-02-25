const Review = require("../models/review.model");
const Book = require("../models/book.model");

async function updateBookRating(bookId) {
  const reviews = await Review.find({ bookId });

  const totalReviews = reviews.length;

  let averageRating = 0;

  if (totalReviews > 0) {
    let sum = 0;

    for (let i = 0; i < reviews.length; i++) {
      sum += reviews[i].rating;
    }

    averageRating = sum / totalReviews;
    averageRating = Number(averageRating.toFixed(2)); 
  }

  await Book.findByIdAndUpdate(bookId, {
    averageRating,
    totalReviews,
  });
}

const getBookReviews = async (req, res) => {
  try {
    const reviews = await Review
      .find({ bookId: req.params.bookId })
      .populate("userId", "name avatar") 
      .sort({ createdAt: -1 });          

    res.json({ total: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ message: "Failed to load reviews" });
  }
};

const addOrUpdateReview = async (req, res) => {
  try {
    const { bookId, rating, reviewText } = req.body;
    const userId = req.user._id;

    if (!bookId) return res.status(400).json({ message: "Book ID is required" });
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });


    let review = await Review.findOne({ userId, bookId });

    if (review) {
      review.rating = rating;
      review.reviewText = reviewText || "";
      await review.save();
    } else {
      await Review.create({ userId, bookId, rating, reviewText: reviewText || "" });
    }

    await updateBookRating(bookId);

    res.json({ message: "Review saved successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to save review" });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own reviews" });
    }

    const bookId = review.bookId;
    await review.deleteOne();
    await updateBookRating(bookId); 

    res.json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete review" });
  }
};

module.exports = { getBookReviews, addOrUpdateReview, deleteReview };
