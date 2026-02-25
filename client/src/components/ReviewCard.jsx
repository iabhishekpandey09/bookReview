import { Stars } from "./BookCard";
import { getAvatarFallback } from "../utils/imageFallbacks";

function ReviewCard({ review, canManage = false, onEdit, onDelete, deleting = false }) {
  const avatarFallback = getAvatarFallback(review.userId?.name || "User", 36);

  // Format date nicely e.g. "Jan 15, 2025"
  const date = new Date(review.createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });

  return (
    <div className="review-card">
      {/* Reviewer info + star rating */}
      <div className="review-header">
        <div className="reviewer-info">
          {/* Avatar circle — image if available, initial if not */}
          <div className="reviewer-avatar">
            {review.userId?.avatar ? (
              <img
                src={review.userId.avatar}
                alt={review.userId.name}
                onError={(e) => { e.target.onerror = null; e.target.src = avatarFallback; }}
              />
            ) : (
              <span>{review.userId?.name?.[0] || "?"}</span>
            )}
          </div>
          <strong className="reviewer-name">
            {review.userId?.name || "Anonymous"}
          </strong>
        </div>

        {/* Star rating on the right */}
        <Stars rating={review.rating} size={16} />
      </div>

      {/* Review text (optional) */}
      {review.reviewText && (
        <p className="review-text">{review.reviewText}</p>
      )}

      {/* Date at the bottom */}
      <div className="review-footer">
        <small className="review-date">{date}</small>

        {canManage && (
          <div className="review-actions">
            <button type="button" className="review-edit-btn" onClick={() => onEdit?.(review)}>
              Edit
            </button>
            <button
              type="button"
              className="review-delete-btn"
              onClick={() => onDelete?.(review)}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReviewCard;
