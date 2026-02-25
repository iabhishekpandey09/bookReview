import { Link } from "react-router-dom";
import { getBookFallbackImage } from "../utils/imageFallbacks";

function BookCard({ book, shelfTag }) {
  const fallbackImg = getBookFallbackImage(book.title, 200, 280);

  return (
    <Link to={`/books/${book._id}`} className="book-card">
      {/* Book cover image */}
      <div className="book-card-cover">
        <img
          src={book.coverImage || fallbackImg}
          alt={book.title}
          onError={(e) => { e.target.onerror = null; e.target.src = fallbackImg; }}
        />
        {/* Show which shelf this book is on (if any) */}
        {shelfTag && (
          <div className="book-shelf-tag">{shelfTag}</div>
        )}
      </div>

      {/* Book info */}
      <div className="book-card-body">
        <h3 className="book-card-title">{book.title}</h3>
        <p className="book-card-author">{book.author}</p>

        {/* Stars + rating number */}
        <div className="book-card-rating">
          <Stars rating={book.averageRating} />
          <span className="rating-number">{Number(book.averageRating).toFixed(1)}</span>
          <span className="rating-count">({book.totalReviews})</span>
        </div>

        {/* Genre tags */}
        <div className="book-card-genres">
          {book.genre?.slice(0, 2).map((g) => (
            <span key={g} className="genre-tag">{g}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}

// ── Small reusable star component ─────────────────────────
export function Stars({ rating, size = 14 }) {
  const filled = Math.round(rating);
  return (
    <span className="stars" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= filled ? "#f59e0b" : "#d1d5db" }}>★</span>
      ))}
    </span>
  );
}

export default BookCard;
