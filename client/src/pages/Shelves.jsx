// ─────────────────────────────────────────────────────────
//  pages/Shelves.jsx
//
//  Shows all the user's shelves (default + custom).
//  Clicking a shelf shows the books on it.
//  User can also create new custom shelves here.
// ─────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { getBookFallbackImage } from "../utils/imageFallbacks";

function Shelves({ user }) {
  const navigate = useNavigate();

  const [shelves, setShelves]           = useState([]);
  const [selectedShelf, setSelectedShelf] = useState(null);
  const [shelfBooks, setShelfBooks]     = useState([]);
  const [newShelfName, setNewShelfName] = useState("");
  const [loading, setLoading]           = useState(true);
  const [msg, setMsg]                   = useState("");
  const shelfFallback = getBookFallbackImage("Book", 50, 70);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadShelves();
  }, [user]);

  const loadShelves = async () => {
    try {
      const res = await API.get("/shelves");
      setShelves(res.data.shelves || []);
    } catch {
      setMsg("Failed to load shelves");
    } finally {
      setLoading(false);
    }
  };

  // Click a shelf → load its books (with full book details)
  const openShelf = async (shelf) => {
    setSelectedShelf(shelf);
    try {
      const res = await API.get(`/shelves/${shelf._id}`);
      setShelfBooks(res.data.books || []);
    } catch {
      setShelfBooks([]);
    }
  };

  // Create a new custom shelf
  const handleCreateShelf = async (e) => {
    e.preventDefault();
    if (!newShelfName.trim()) return;

    try {
      await API.post("/shelves", { name: newShelfName });
      setNewShelfName("");
      setMsg("Shelf created! ✓");
      loadShelves();
      setTimeout(() => setMsg(""), 2000);
    } catch {
      setMsg("Failed to create shelf (name may already exist)");
    }
  };

  // Remove a book from the currently open shelf
  const handleRemoveBook = async (bookId) => {
    try {
      await API.delete(`/shelves/${selectedShelf._id}/books/${bookId}`);
      // Update the list locally without refetching
      setShelfBooks((prev) => prev.filter((b) => b._id !== bookId));
      // Update shelf count locally
      setShelves((prev) =>
        prev.map((s) =>
          s._id === selectedShelf._id
            ? { ...s, books: s.books.filter((id) => id !== bookId) }
            : s
        )
      );
    } catch {
      setMsg("Failed to remove book");
    }
  };

  if (loading) return <p className="container state-msg">Loading shelves...</p>;

  // Sort: default shelves first, then custom
  const sortedShelves = [
    ...shelves.filter((s) => s.type === "default"),
    ...shelves.filter((s) => s.type === "custom"),
  ];

  return (
    <div className="container">
      <h1 className="page-title">My Shelves</h1>
      {msg && <p className="success-msg">{msg}</p>}

      <div className="shelves-layout">
        {/* ── Left sidebar: list of shelves ──────────────────── */}
        <aside className="shelves-sidebar">
          {sortedShelves.map((shelf) => (
            <div
              key={shelf._id}
              className={`shelf-item ${selectedShelf?._id === shelf._id ? "shelf-item-active" : ""}`}
              onClick={() => openShelf(shelf)}
            >
              <span className="shelf-item-name">
                {shelf.type === "default" ? "📚" : "📂"} {shelf.name}
              </span>
              <span className="shelf-item-count">{shelf.books?.length || 0}</span>
            </div>
          ))}

          {/* Create new shelf form */}
          <form className="create-shelf-form" onSubmit={handleCreateShelf}>
            <input
              type="text"
              className="create-shelf-input"
              placeholder="New shelf name..."
              value={newShelfName}
              onChange={(e) => setNewShelfName(e.target.value)}
            />
            <button type="submit" className="btn btn-success">+ Create</button>
          </form>
        </aside>

        {/* ── Right panel: books on selected shelf ────────────── */}
        <main className="shelf-books-panel">
          {!selectedShelf ? (
            <div className="shelf-empty-state">
              <p>👈 Select a shelf to see its books</p>
            </div>
          ) : (
            <>
              <h2 className="shelf-panel-title">
                {selectedShelf.name}
                <span className="shelf-panel-count"> · {shelfBooks.length} books</span>
              </h2>

              {shelfBooks.length === 0 ? (
                <div className="shelf-empty-state">
                  <p>📭 No books here yet</p>
                  <Link to="/" className="btn btn-primary" style={{ marginTop: 12 }}>
                    Browse Books
                  </Link>
                </div>
              ) : (
                <div className="shelf-book-list">
                  {shelfBooks.map((book) => (
                    <div key={book._id} className="shelf-book-row">
                      {/* Thumbnail */}
                      <img
                        className="shelf-book-thumb"
                        src={book.coverImage || shelfFallback}
                        alt={book.title}
                        onError={(e) => { e.target.onerror = null; e.target.src = shelfFallback; }}
                      />

                      {/* Info */}
                      <div className="shelf-book-info">
                        <Link to={`/books/${book._id}`} className="shelf-book-title">
                          {book.title}
                        </Link>
                        <p className="shelf-book-author">{book.author}</p>
                        <p className="shelf-book-rating">⭐ {Number(book.averageRating).toFixed(1)}</p>
                      </div>

                      {/* Remove button */}
                      <button
                        className="remove-btn"
                        onClick={() => handleRemoveBook(book._id)}
                        title="Remove from shelf"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Shelves;
