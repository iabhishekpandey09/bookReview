const express        = require("express");
const router         = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getBookReviews, addOrUpdateReview, deleteReview } = require("../controllers/review.controller");


router.get("/:bookId", getBookReviews);


router.post("/", authMiddleware, addOrUpdateReview);

router.delete("/:reviewId", authMiddleware, deleteReview);

module.exports = router;





