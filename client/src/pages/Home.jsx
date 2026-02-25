import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import API from "../api/axios";
import BookCard from "../components/BookCard";

function Home({ user }) {
  const location = useLocation();

  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shelves, setShelves] = useState([]);

  useEffect(() => {
    if (!searchQuery) {
      loadBooks();
    }
  }, [page]);

  useEffect(() => {
    if (!user) {
      setShelves([]);
      return;
    }

    API.get("/shelves")
      .then((res) => setShelves(res.data.shelves || []))
      .catch(() => {});
  }, [user, location.pathname]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get(`/books?page=${page}&limit=12`);
      setBooks(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch {
      setError("Failed to load books. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    try {
      setLoading(true);
      const res = await API.get(`/books/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(res.data.results || []);
    } catch {
      setError("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults(null);
    setError("");
  };

  const getShelfTag = (bookId) => {
    const orderedShelves = [
      ...shelves.filter((s) => s.type === "default"),
      ...shelves.filter((s) => s.type === "custom"),
    ];

    for (const shelf of orderedShelves) {
      if ((shelf.books || []).some((id) => id.toString() === bookId.toString())) {
        return shelf.name;
      }
    }

    return null;
  };

  const displayedBooks = searchResults !== null ? searchResults : books;

  return (
    <div>
      <div className="hero">
        <div className="hero-content">
          <p className="hero-eyebrow">Search | Shelf | Share</p>
          <h1 className="hero-title">
            Find Your Next
            <br />
            <em>Favorite Book</em>
          </h1>
          <p className="hero-subtitle">
            Explore top books, organize shelves your way, and post quick reviews.
          </p>

          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              className="search-input"
              placeholder="Search by title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-btn">
              Search
            </button>
            {searchResults !== null && (
              <button type="button" className="clear-btn" onClick={clearSearch}>
                Clear
              </button>
            )}
          </form>
        </div>
      </div>

      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            {searchResults !== null ? `Search Results (${searchResults.length})` : "Trending Books"}
          </h2>
          {searchResults === null && <span className="section-sub">Sorted by most reviewed</span>}
        </div>

        {loading && <p className="state-msg">Loading books...</p>}
        {error && <p className="state-msg error">{error}</p>}
        {!loading && !error && displayedBooks.length === 0 && (
          <p className="state-msg">No books found for "{searchQuery}"</p>
        )}

        {!loading && !error && (
          <div className="book-grid">
            {displayedBooks.map((book) => (
              <BookCard key={book._id} book={book} shelfTag={user ? getShelfTag(book._id) : null} />
            ))}
          </div>
        )}

        {searchResults === null && !loading && (
          <div className="pagination">
            <button
              className="btn btn-secondary"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
            >
              Prev
            </button>
            <span className="page-info">
              Page {page} of {totalPages}
            </span>
            <button
              className="btn btn-secondary"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
