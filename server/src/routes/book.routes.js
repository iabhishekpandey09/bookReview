const express = require("express");
const router  = express.Router();
const { getAllBooks, searchBooks, getSingleBook } = require("../controllers/book.controller");

router.get("/", getAllBooks);


router.get("/search", searchBooks);


router.get("/:id", getSingleBook);

module.exports = router;
