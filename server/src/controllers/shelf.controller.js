const Shelf = require("../models/shelf.model");
const Book  = require("../models/book.model");

const getUserShelves = async (req, res) => {
  try {
    const shelves = await Shelf.find({ userId: req.user._id });
    res.json({ shelves });
  } catch (error) {
    res.status(500).json({ message: "Failed to load shelves" });
  }
};

const getShelfBooks = async (req, res) => {
  try {
    const shelf = await Shelf.findById(req.params.shelfId).populate("books");

    if (!shelf) {
      return res.status(404).json({ message: "Shelf not found" });
    }

    if (shelf.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "This shelf doesn't belong to you" });
    }

    res.json({ shelfName: shelf.name, type: shelf.type, books: shelf.books });
  } catch (error) {
    res.status(500).json({ message: "Failed to load shelf" });
  }
};

const moveBookToShelf = async (req, res) => {
  try {
    const { bookId, targetShelfId } = req.body;
    const userId = req.user._id;

    if (!bookId || !targetShelfId) {
      return res.status(400).json({ message: "bookId and targetShelfId are required" });
    }

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    const targetShelf = await Shelf.findById(targetShelfId);
    if (!targetShelf) return res.status(404).json({ message: "Target shelf not found" });
    if (targetShelf.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "This shelf doesn't belong to you" });
    }

    await Shelf.updateMany(
      { userId },
      { $pull: { books: bookId } }
    );

    const updatedShelf = await Shelf.findByIdAndUpdate(
      targetShelfId,
      { $addToSet: { books: bookId } },
      { new: true }
    );

    res.json({
      message: "Book moved successfully",
      shelf: updatedShelf
        ? { _id: updatedShelf._id, name: updatedShelf.name, type: updatedShelf.type }
        : null,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to move book" });
  }
};

const createCustomShelf = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user._id;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Shelf name cannot be empty" });
    }

    const existing = await Shelf.findOne({ userId, name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: "You already have a shelf with this name" });
    }

    const newShelf = await Shelf.create({
      userId,
      name: name.trim(),
      type: "custom",
      books: [],
    });

    res.status(201).json({ message: "Shelf created!", shelf: newShelf });
  } catch (error) {
    res.status(500).json({ message: "Failed to create shelf" });
  }
};

const removeBookFromShelf = async (req, res) => {
  try {
    const { shelfId, bookId } = req.params;

    const shelf = await Shelf.findById(shelfId);
    if (!shelf) return res.status(404).json({ message: "Shelf not found" });
    if (shelf.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "This shelf doesn't belong to you" });
    }

    shelf.books = shelf.books.filter((id) => id.toString() !== bookId);
    await shelf.save();

    res.json({ message: "Book removed from shelf" });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove book" });
  }
};

module.exports = {
  getUserShelves,
  getShelfBooks,
  moveBookToShelf,
  createCustomShelf,
  removeBookFromShelf,
};
