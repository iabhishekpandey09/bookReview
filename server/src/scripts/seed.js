const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const mongoose = require("mongoose");
const Book     = require("../models/book.model");
const User     = require("../models/user.model");
const Review   = require("../models/review.model");
const Shelf    = require("../models/shelf.model");

function toDataUri(svg) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function bookCoverDataUri(title, color = "3b82f6") {
  const safeTitle = String(title || "Book").slice(0, 12);
  const svg = `
<svg xmlns='http://www.w3.org/2000/svg' width='200' height='280' viewBox='0 0 200 280'>
  <rect width='100%' height='100%' fill='#0f172a'/>
  <rect x='10' y='10' width='180' height='260' rx='10' fill='none' stroke='#${color}' stroke-width='4'/>
  <text x='50%' y='50%' text-anchor='middle' fill='#f8fafc' font-size='18' font-family='Arial, sans-serif' dy='-8'>BOOK</text>
  <text x='50%' y='50%' text-anchor='middle' fill='#${color}' font-size='13' font-family='Arial, sans-serif' dy='14'>${safeTitle}</text>
</svg>`;
  return toDataUri(svg);
}

function avatarDataUri(name, size = 150) {
  const label = String(name || "User").slice(0, 1).toUpperCase();
  const fontSize = Math.floor(size * 0.42);
  const svg = `
<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>
  <defs>
    <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0%' stop-color='#f59e0b'/>
      <stop offset='100%' stop-color='#ef4444'/>
    </linearGradient>
  </defs>
  <circle cx='${size / 2}' cy='${size / 2}' r='${size / 2}' fill='url(#g)'/>
  <text x='50%' y='50%' text-anchor='middle' fill='#ffffff' font-size='${fontSize}' font-family='Arial, sans-serif' dy='.35em'>${label}</text>
</svg>`;
  return toDataUri(svg);
}

// ── Sample data to build books from ──────────────────────
const BASE_BOOKS = [
  { title: "Atomic Habits",              author: "James Clear",          genre: ["Self-Help"],          pageCount: 320 },
  { title: "Deep Work",                  author: "Cal Newport",          genre: ["Self-Help"],          pageCount: 296 },
  { title: "The Alchemist",             author: "Paulo Coelho",         genre: ["Fiction"],            pageCount: 197 },
  { title: "1984",                       author: "George Orwell",        genre: ["Fiction","Dystopia"], pageCount: 328 },
  { title: "Brave New World",           author: "Aldous Huxley",        genre: ["Fiction","Sci-Fi"],   pageCount: 311 },
  { title: "Sapiens",                   author: "Yuval Noah Harari",    genre: ["History"],            pageCount: 443 },
  { title: "Dune",                      author: "Frank Herbert",        genre: ["Sci-Fi","Fiction"],   pageCount: 412 },
  { title: "The Hobbit",               author: "J.R.R. Tolkien",       genre: ["Fantasy"],            pageCount: 310 },
  { title: "Harry Potter & Sorcerer",   author: "J.K. Rowling",         genre: ["Fantasy"],            pageCount: 309 },
  { title: "The Da Vinci Code",         author: "Dan Brown",            genre: ["Mystery","Thriller"], pageCount: 454 },
  { title: "Gone Girl",                 author: "Gillian Flynn",        genre: ["Mystery","Thriller"], pageCount: 422 },
  { title: "Pride and Prejudice",       author: "Jane Austen",          genre: ["Romance","Fiction"],  pageCount: 432 },
  { title: "A Brief History of Time",   author: "Stephen Hawking",      genre: ["Science"],            pageCount: 212 },
  { title: "Thinking Fast and Slow",    author: "Daniel Kahneman",      genre: ["Science","Non-Fiction"],pageCount:499 },
  { title: "Educated",                  author: "Tara Westover",        genre: ["Biography"],          pageCount: 334 },
  { title: "Becoming",                  author: "Michelle Obama",       genre: ["Biography"],          pageCount: 448 },
  { title: "Clean Code",               author: "Robert C. Martin",     genre: ["Technology"],         pageCount: 431 },
  { title: "The Pragmatic Programmer",  author: "David Thomas",         genre: ["Technology"],         pageCount: 352 },
  { title: "Meditations",              author: "Marcus Aurelius",      genre: ["Philosophy"],         pageCount: 253 },
  { title: "Crime and Punishment",     author: "Fyodor Dostoevsky",   genre: ["Fiction","Classic"],  pageCount: 551 },
  { title: "The Great Gatsby",          author: "F. Scott Fitzgerald",  genre: ["Fiction","Classic"],  pageCount: 180 },
  { title: "To Kill a Mockingbird",    author: "Harper Lee",           genre: ["Fiction","Classic"],  pageCount: 336 },
  { title: "The Catcher in the Rye",   author: "J.D. Salinger",       genre: ["Fiction"],            pageCount: 214 },
  { title: "War and Peace",             author: "Leo Tolstoy",          genre: ["Fiction","History"],  pageCount: 1225},
  { title: "The Count of Monte Cristo", author: "Alexandre Dumas",      genre: ["Fiction","Adventure"],pageCount:1276 },
  { title: "Steve Jobs",               author: "Walter Isaacson",      genre: ["Biography"],          pageCount: 630 },
  { title: "The Selfish Gene",          author: "Richard Dawkins",      genre: ["Science"],            pageCount: 360 },
  { title: "Outlander",                author: "Diana Gabaldon",       genre: ["Romance","Fantasy"],  pageCount: 850 },
  { title: "The Republic",             author: "Plato",                genre: ["Philosophy"],         pageCount: 416 },
  { title: "The Girl with Dragon Tattoo",author:"Stieg Larsson",       genre: ["Mystery","Thriller"], pageCount: 672 },
];

const DESCRIPTIONS = [
  "A compelling journey through complex themes with vivid, unforgettable characters.",
  "A thought-provoking book that challenges conventional wisdom and offers fresh perspectives.",
  "A masterpiece that blends history, culture, and human drama into a rich tapestry.",
  "A gripping page-turner that keeps you on the edge of your seat from start to finish.",
  "Profound insights that change the way you see the world. Impossible to put down.",
  "Beautiful prose and an immersive world that stays with you long after the last page.",
  "An extraordinary book that left me speechless — essential reading for everyone.",
];

// Rotating placeholder covers (using gradient-based placeholder service)
const COVER_COLORS = [
  "f59e0b", "ef4444", "10b981", "3b82f6", "8b5cf6",
  "ec4899", "06b6d4", "84cc16", "f97316", "6366f1",
];

const USER_NAMES = [
  "Alice","Bob","Carol","David","Eva","Frank","Grace","Hank",
  "Iris","Jack","Karen","Liam","Mia","Noah","Olivia","Pete",
  "Quinn","Rose","Sam","Tina","Uma","Vince","Wendy","Xander",
  "Yara","Zane","Ava","Ben","Cleo","Dan",
];

const REVIEW_TEXTS = [
  "Absolutely loved this book! A must-read.",
  "Couldn't put it down. One of the best this year.",
  "Interesting read, though some parts felt slow. Worth it.",
  "Changed the way I think. Highly recommended.",
  "Well-written and engaging from start to finish.",
  "A bit overhyped, but still a solid read.",
  "Profound and deeply moving. Will read again.",
  "The author's writing style is beautiful and immersive.",
  "Good but not great. Has its moments.",
  "An extraordinary book that left me speechless.",
];

async function seed() {
  console.log("🌱 Starting seed...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  // Clear all existing data first
  await Promise.all([
    Book.deleteMany({}),
    User.deleteMany({}),
    Review.deleteMany({}),
    Shelf.deleteMany({}),
  ]);
  console.log("🗑️  Cleared existing data");

  // ── Create 1000 books ────────────────────────────────────
  const books = [];
  for (let i = 0; i < 1000; i++) {
    const base   = BASE_BOOKS[i % BASE_BOOKS.length];
    const vol    = Math.floor(i / BASE_BOOKS.length);
    const color  = COVER_COLORS[i % COVER_COLORS.length];
    const suffix = vol > 0 ? ` (Vol. ${vol + 1})` : "";

    books.push({
      title:        base.title + suffix,
      author:       base.author,
      description:  DESCRIPTIONS[i % DESCRIPTIONS.length],
      coverImage:   bookCoverDataUri(base.title, color),
      genre:        base.genre,
      pageCount:    base.pageCount + Math.floor(Math.random() * 80) - 40,
      averageRating: 0,
      totalReviews:  0,
    });
  }
  const createdBooks = await Book.insertMany(books);
  console.log(`📚 Created ${createdBooks.length} books`);

  // ── Create 30 fake users ──────────────────────────────────
const users = USER_NAMES.map((name, i) => ({
    googleId: `seed_google_id_${i + 1}`,
    name:     name,
    email:    `${name.toLowerCase()}@example.com`,
    avatar:   avatarDataUri(name, 150),
  }));
  const createdUsers = await User.insertMany(users);
  console.log(`👤 Created ${createdUsers.length} users`);

  // ── Create default shelves for every user ─────────────────
  const shelfDocs = [];
  for (const user of createdUsers) {
    shelfDocs.push(
      { userId: user._id, name: "Want to Read",      type: "default", books: [] },
      { userId: user._id, name: "Currently Reading", type: "default", books: [] },
      { userId: user._id, name: "Read",              type: "default", books: [] }
    );
  }
  await Shelf.insertMany(shelfDocs);
  console.log("📂 Created default shelves for all users");

  // ── Create 300 reviews ────────────────────────────────────
  // Focus reviews on the first 100 books so some look "popular"
  const usedPairs = new Set();
  const reviewDocs = [];

  while (reviewDocs.length < 300) {
    const user   = createdUsers[Math.floor(Math.random() * createdUsers.length)];
    const book   = createdBooks[Math.floor(Math.random() * 100)];
    const pairKey = `${user._id}-${book._id}`;

    if (usedPairs.has(pairKey)) continue; // skip duplicates
    usedPairs.add(pairKey);

    reviewDocs.push({
      userId:     user._id,
      bookId:     book._id,
      rating:     Math.ceil(Math.random() * 5),
      reviewText: REVIEW_TEXTS[Math.floor(Math.random() * REVIEW_TEXTS.length)],
    });
  }
  await Review.insertMany(reviewDocs);
  console.log(`⭐ Created ${reviewDocs.length} reviews`);

  // ── Update each book's averageRating and totalReviews ─────
  const bookStats = {};
  for (const r of reviewDocs) {
    const id = r.bookId.toString();
    if (!bookStats[id]) bookStats[id] = { total: 0, count: 0 };
    bookStats[id].total += r.rating;
    bookStats[id].count += 1;
  }
  for (const [bookId, stats] of Object.entries(bookStats)) {
    await Book.findByIdAndUpdate(bookId, {
      averageRating: parseFloat((stats.total / stats.count).toFixed(2)),
      totalReviews:  stats.count,
    });
  }
  console.log("Updated book ratings");

  await mongoose.disconnect();
  console.log(" Seeding complete! You can now start the server.");
}

seed().catch((err) => {
  console.error(" Seed failed:", err);
  process.exit(1);
});
