import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import ReviewCard from "../components/ReviewCard";
import { Stars } from "../components/BookCard";
import { getBookFallbackImage } from "../utils/imageFallbacks";

const DEFAULT_SHELVES = ["Want to Read", "Currently Reading", "Read"];

function shelfHasBook(shelf, bookId) {
  return (shelf.books || []).some((id) => id.toString() === bookId.toString());
}

function sortShelves(allShelves) {
  return [
    ...allShelves.filter((s) => s.type === "default"),
    ...allShelves.filter((s) => s.type === "custom"),
  ];
}

function BookDetails({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [currentShelfId, setCurrentShelfId] = useState("");
  const [loading, setLoading] = useState(true);

  const [myRating, setMyRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewMsg, setReviewMsg] = useState("");
  const [shelfMsg, setShelfMsg] = useState("");
  const [deletingReviewId, setDeletingReviewId] = useState("");
  const reviewFormRef = useRef(null);

  useEffect(() => {
    loadPageData();
  }, [id, user?.id]);

  const loadPageData = async () => {
    try {
      setLoading(true);

      const [bookRes, reviewRes] = await Promise.all([
        API.get(`/books/${id}`),
        API.get(`/reviews/${id}`),
      ]);

      setBook(bookRes.data);
      setReviews(reviewRes.data.reviews || []);

      if (user) {
        const shelvesRes = await API.get("/shelves");
        const userShelves = shelvesRes.data.shelves || [];
        setShelves(userShelves);

        const foundShelf = userShelves.find((shelf) => shelfHasBook(shelf, id));
        setCurrentShelfId(foundShelf?._id || "");

        const myReview = (reviewRes.data.reviews || []).find(
          (r) => r.userId?._id === user.id,
        );
        if (myReview) {
          setMyRating(myReview.rating);
          setReviewText(myReview.reviewText || "");
        } else {
          setMyRating(0);
          setReviewText("");
        }
      } else {
        setShelves([]);
        setCurrentShelfId("");
        setMyRating(0);
        setReviewText("");
      }
    } catch (err) {
      console.error("Failed to load book:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateShelfState = (targetShelfId, shouldAdd) => {
    setShelves((prev) =>
      prev.map((shelf) => {
        const withoutBook = (shelf.books || []).filter(
          (bookId) => bookId.toString() !== id.toString(),
        );

        if (shouldAdd && shelf._id === targetShelfId) {
          return { ...shelf, books: [...withoutBook, id] };
        }

        return { ...shelf, books: withoutBook };
      }),
    );
  };

  const handleMoveToShelf = async (targetShelfId) => {
    if (!user) {
      navigate("/login");
      return;
    }

    const targetShelf = shelves.find((shelf) => shelf._id === targetShelfId);
    if (!targetShelf) return;

    try {
      if (currentShelfId === targetShelfId) {
        await API.delete(`/shelves/${targetShelfId}/books/${id}`);
        setCurrentShelfId("");
        updateShelfState(targetShelfId, false);
        setShelfMsg(`Removed from "${targetShelf.name}"`);
      } else {
        await API.put("/shelves/move", {
          bookId: id,
          targetShelfId,
        });
        setCurrentShelfId(targetShelfId);
        updateShelfState(targetShelfId, true);
        setShelfMsg(`Moved to "${targetShelf.name}"`);
      }

      setTimeout(() => setShelfMsg(""), 2000);
    } catch {
      setShelfMsg("Something went wrong");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate("/login");
      return;
    }
    if (!myRating) {
      setReviewMsg("Please select a star rating");
      return;
    }

    try {
      await API.post("/reviews", {
        bookId: id,
        rating: myRating,
        reviewText,
      });
      setReviewMsg("Review saved");
      loadPageData();
      setTimeout(() => setReviewMsg(""), 3000);
    } catch {
      setReviewMsg("Failed to save review");
    }
  };

  const handleEditReview = (review) => {
    setMyRating(review.rating || 0);
    setReviewText(review.reviewText || "");
    setReviewMsg("You can now edit your review below");
    reviewFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => setReviewMsg(""), 2500);
  };

  const handleDeleteReview = async (review) => {
    if (!user || review.userId?._id !== user.id) return;

    const confirmDelete = window.confirm("Delete your review?");
    if (!confirmDelete) return;

    try {
      setDeletingReviewId(review._id);
      await API.delete(`/reviews/${review._id}`);
      setMyRating(0);
      setReviewText("");
      setReviewMsg("Review deleted");
      await loadPageData();
      setTimeout(() => setReviewMsg(""), 2500);
    } catch {
      setReviewMsg("Failed to delete review");
    } finally {
      setDeletingReviewId("");
    }
  };

  if (loading) return <p className="container state-msg">Loading book...</p>;
  if (!book) return <p className="container state-msg error">Book not found.</p>;

  const fallbackImg = getBookFallbackImage(book.title, 200, 280);
  const orderedShelves = sortShelves(shelves);
  const currentShelf = orderedShelves.find((s) => s._id === currentShelfId);
  const myReview = user ? reviews.find((r) => r.userId?._id === user.id) : null;

  return (
    <div className="container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        Back
      </button>

      <div className="book-hero-card">
        <img
          className="book-hero-cover"
          src={book.coverImage || fallbackImg}
          alt={book.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackImg;
          }}
        />

        <div className="book-hero-info">
          <div className="genre-tags">
            {book.genre?.map((g) => (
              <span key={g} className="genre-tag">
                {g}
              </span>
            ))}
          </div>

          <h1 className="book-hero-title">{book.title}</h1>
          <p className="book-hero-author">by {book.author}</p>

          <div className="book-rating-row">
            <Stars rating={book.averageRating} size={20} />
            <span className="rating-big">{Number(book.averageRating).toFixed(1)}</span>
            <span className="rating-count">from {book.totalReviews} reviews</span>
          </div>

          <p className="book-pages">{book.pageCount} pages</p>
          <p className="book-description">{book.description}</p>

          <div className="shelf-section">
            <p className="shelf-label">Move to shelf:</p>

            <div className="shelf-buttons">
              {DEFAULT_SHELVES.map((name) => {
                const shelf = shelves.find((s) => s.type === "default" && s.name === name);
                if (!shelf) return null;

                return (
                  <button
                    key={shelf._id}
                    className={`shelf-btn ${currentShelfId === shelf._id ? "shelf-btn-active" : ""}`}
                    onClick={() => handleMoveToShelf(shelf._id)}
                  >
                    {currentShelfId === shelf._id ? "Selected: " : "Move to "}
                    {name}
                  </button>
                );
              })}
            </div>

            {orderedShelves.some((shelf) => shelf.type === "custom") && (
              <div className="shelf-buttons">
                {orderedShelves
                  .filter((shelf) => shelf.type === "custom")
                  .map((shelf) => (
                    <button
                      key={shelf._id}
                      className={`shelf-btn ${currentShelfId === shelf._id ? "shelf-btn-active" : ""}`}
                      onClick={() => handleMoveToShelf(shelf._id)}
                    >
                      {currentShelfId === shelf._id ? "Selected: " : "Move to "}
                      {shelf.name}
                    </button>
                  ))}
              </div>
            )}

            {currentShelf && <p className="shelf-login-hint">Current shelf: {currentShelf.name}</p>}

            {!user && (
              <p className="shelf-login-hint">
                <a href="/login">Log in</a> to add books to your shelves
              </p>
            )}

            {shelfMsg && <p className="success-msg">{shelfMsg}</p>}
          </div>
        </div>
      </div>

      {user && (
        <div className="review-form-card" ref={reviewFormRef}>
          <h3 className="card-title">
            {myReview ? "Edit Your Review" : "Write a Review"}
          </h3>

          <form onSubmit={handleReviewSubmit}>
            <div className="star-picker">
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  className={`star-pick ${s <= (hoverRating || myRating) ? "star-filled" : ""}`}
                  onClick={() => setMyRating(s)}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  *
                </span>
              ))}
              {myRating > 0 && (
                <span className="star-label">
                  {["", "Poor", "Fair", "Good", "Great", "Amazing!"][myRating]}
                </span>
              )}
            </div>

            <textarea
              className="review-textarea"
              placeholder="Write your thoughts... (optional)"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
            />

            <div className="review-submit-row">
              <button type="submit" className="btn btn-primary">
                Submit Review
              </button>
              {reviewMsg && <span className="success-msg">{reviewMsg}</span>}
            </div>
          </form>
        </div>
      )}

      <div className="reviews-section">
        <h3 className="section-title">Reviews ({reviews.length})</h3>

        {reviews.length === 0 ? (
          <p className="state-msg">No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              canManage={Boolean(user && review.userId?._id === user.id)}
              onEdit={handleEditReview}
              onDelete={handleDeleteReview}
              deleting={deletingReviewId === review._id}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default BookDetails;
