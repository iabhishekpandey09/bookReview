const Book = require("../models/book.model");

const getAllBooks = async (req, res) => {
  try {
    const books = await Book
      .find()
      .sort({ totalReviews: -1, averageRating: -1 })
      .limit(30) 
      .lean();

    res.json({
      success: true,
      data: books
    });

  } catch (error) {
    res.status(500).json({ message: "Failed to load books" });
  }
};

const searchBooks = async (req, res) => {
  try {
    const query = req.query.q;

    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Search query cannot be empty" });
    }

    const books = await Book
      .find({
        $or: [
          { title: { $regex: query, $options: "i" } },
          { author: { $regex: query, $options: "i" } },
        ],
      })
      .limit(20)
      .lean();

    res.json({ results: books });
  } catch (error) {
    res.status(500).json({ message: "Search failed" });
  }
};

const getSingleBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ message: "Failed to load book" });
  }
};

module.exports = { getAllBooks, searchBooks, getSingleBook };
