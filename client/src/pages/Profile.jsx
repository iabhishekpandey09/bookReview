// ─────────────────────────────────────────────────────────
//  pages/Profile.jsx
//
//  Shows the logged-in user's:
//  - Name and avatar (from Google)
//  - Stats: total reviews, average rating
//  - List of their recent reviews
// ─────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Stars } from "../components/BookCard";
import { getAvatarFallback, getBookFallbackImage } from "../utils/imageFallbacks";

function Profile({ user }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      // Use fetch directly (not axios) because this is /auth/profile not /api/profile
      const res = await fetch("/auth/profile", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setProfile(data);
    } catch {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="container state-msg">Loading profile...</p>;
  if (error)   return <p className="container state-msg error">{error}</p>;
  if (!profile) return null;

  const { user: profileUser, stats, recentReviews } = profile;
  const profileAvatarFallback = getAvatarFallback(profileUser.name, 80);
  const reviewBookFallback = getBookFallbackImage("Book", 48, 64);

  return (
    <div className="container">
      {/* ── Profile Header ───────────────────────────────────── */}
      <div className="profile-header">
        <div className="profile-avatar-wrap">
          {profileUser.avatar ? (
            <img
              src={profileUser.avatar}
              alt={profileUser.name}
              className="profile-avatar"
              onError={(e) => { 
                e.target.onerror = null; 
                e.target.src = profileAvatarFallback; 
              }}
            />
          ) : (
            <div className="profile-avatar-placeholder">
              {profileUser.name[0]}
            </div>
          )}
        </div>
        <div>
          <h1 className="profile-name">{profileUser.name}</h1>
          <p className="profile-email">{profileUser.email}</p>
        </div>
      </div>

      {/* ── Stats Row ────────────────────────────────────────── */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{stats.totalReviews}</div>
          <div className="stat-label">Reviews Written</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.avgRating}</div>
          <div className="stat-label">Avg Rating Given</div>
        </div>
      </div>

      {/* ── Recent Reviews ───────────────────────────────────── */}
      <h2 className="section-title" style={{ marginBottom: 16 }}>
        Your Recent Reviews
      </h2>

      {recentReviews.length === 0 ? (
        <div className="profile-empty">
          <p>You haven't written any reviews yet.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 12 }}>
            Browse Books to Review
          </Link>
        </div>
      ) : (
        <div>
          {recentReviews.map((review) => (
            <div key={review._id} className="profile-review-card">
              {/* Book info on the left */}
              <div className="profile-review-book">
                <img
                  src={review.bookId?.coverImage || reviewBookFallback}
                  alt={review.bookId?.title}
                  className="profile-book-thumb"
                  onError={(e) => { e.target.onerror = null; e.target.src = reviewBookFallback; }}
                />
                <div>
                  <Link to={`/books/${review.bookId?._id}`} className="profile-book-link">
                    {review.bookId?.title || "Unknown Book"}
                  </Link>
                  <p className="profile-book-author">{review.bookId?.author}</p>
                  <Stars rating={review.rating} size={14} />
                </div>
              </div>

              {/* Review text */}
              {review.reviewText && (
                <p className="profile-review-text">"{review.reviewText}"</p>
              )}

              <small className="review-date">
                {new Date(review.createdAt).toLocaleDateString("en-US", {
                  year: "numeric", month: "short", day: "numeric",
                })}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Profile;
