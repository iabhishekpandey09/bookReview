// ─────────────────────────────────────────────────────────
//  routes/shelf.routes.js
//
//  All routes starting with /api/shelves
//  ALL routes require login (authMiddleware applied globally)
// ─────────────────────────────────────────────────────────

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getUserShelves,
  getShelfBooks,
  moveBookToShelf,
  createCustomShelf,
  removeBookFromShelf,
} = require("../controllers/shelf.controller");

router.use(authMiddleware);

router.get("/", getUserShelves);

router.post("/", createCustomShelf);

router.put("/move", moveBookToShelf);

router.get("/:shelfId", getShelfBooks);


router.delete("/:shelfId/books/:bookId", removeBookFromShelf);

module.exports = router;




