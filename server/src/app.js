
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const passport = require("./config/passport");

// Import all route files
const authRoutes = require("./routes/auth.routes");
const bookRoutes = require("./routes/book.routes");
const shelfRoutes = require("./routes/shelf.routes");
const reviewRoutes = require("./routes/review.routes");

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,          
}));

app.use(express.json());      // lets us read req.body as JSON
app.use(cookieParser());      // lets us read/write cookies
app.use(passport.initialize()); // sets up Google OAuth

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running!" });
});

// ── Mount all route groups ────────────────────────────────
// /auth/...    → login, logout, get current user
// /api/books/... → browse and search books
// /api/shelves/... → manage reading shelves
// /api/reviews/... → read and write reviews
app.use("/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/shelves", shelfRoutes);
app.use("/api/reviews", reviewRoutes);

module.exports = app;
