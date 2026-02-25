// ─────────────────────────────────────────────────────────
//  pages/Login.jsx
//
//  Simple login page with a "Sign in with Google" button.
//  If user is already logged in, redirect to homepage.
// ─────────────────────────────────────────────────────────

import { Navigate } from "react-router-dom";

function Login({ user }) {
  // If already logged in, send to homepage
  if (user) return <Navigate to="/" replace />;

  const handleGoogleLogin = () => {
    // This redirects to the backend which starts the Google OAuth flow
    window.location.href = "/auth/google";
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-icon">📚</div>
        <h1 className="login-title">Welcome to BookReview</h1>
        <p className="login-subtitle">
          Discover books, track your reading, and share your thoughts with readers worldwide.
        </p>

        <button className="google-btn" onClick={handleGoogleLogin}>
          {/* Google's official "G" logo colors */}
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20H24v8h11.3A12 12 0 0112 24 12 12 0 0124 12c3.1 0 5.8 1.2 8 3l5.7-5.7A20 20 0 004 24a20 20 0 0036 12 20 20 0 003.6-16z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8A12 12 0 0124 12c3 0 5.8 1.2 8 3l5.7-5.7A20 20 0 006.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44a20 20 0 0013.4-5.2l-6.2-5.2A12 12 0 0112.3 31l-6.5 5A20 20 0 0024 44z"/>
            <path fill="#1976D2" d="M43.6 20H24v8h11.3a12 12 0 01-4.1 5.6l6.2 5.2A20 20 0 0044 24c0-1.3-.1-2.7-.4-4z"/>
          </svg>
          Sign in with Google
        </button>

        <p className="login-note">
          No password needed. We use your Google account to sign you in securely.
        </p>
      </div>
    </div>
  );
}

export default Login;
