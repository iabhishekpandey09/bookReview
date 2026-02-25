const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },

  author: {
    type: String,
    required: true,
    trim: true,
  },

  description: {
    type: String,
    default: "",
  },

  coverImage: {
    type: String,
    default: "",
  },

  genre: {
    type: [String],
    default: [],
  },

  pageCount: {
    type: Number,
    default: 0,
  },

  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },

  totalReviews: {
    type: Number,
    default: 0,
  },
});


bookSchema.index({ title: "text", author: "text" });

module.exports = mongoose.model("Book", bookSchema);
