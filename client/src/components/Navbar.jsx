import { Link, useLocation } from "react-router-dom";
import { getAvatarFallback } from "../utils/imageFallbacks";

function Navbar({ user, authLoading, onLogout }) {
  const location = useLocation();
  const avatarFallback = getAvatarFallback(user?.name || "User", 32);
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        BookReview
      </Link>

      <div className="navbar-links">
        <Link to="/" className={isActive("/") ? "nav-link active" : "nav-link"}>
          Home
        </Link>
        {user && (
          <>
            <Link to="/shelves" className={isActive("/shelves") ? "nav-link active" : "nav-link"}>
              Shelves
            </Link>
            <Link to="/profile" className={isActive("/profile") ? "nav-link active" : "nav-link"}>
              Profile
            </Link>
          </>
        )}
      </div>

      <div className="navbar-right">
        {authLoading ? (
          <span className="nav-loading">Loading...</span>
        ) : user ? (
          <>
            <div className="nav-user">
              <img
                src={user.avatar || avatarFallback}
                alt={user.name}
                className="nav-avatar"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = avatarFallback;
                }}
              />
              <span className="nav-username">{user.name.split(" ")[0]}</span>
            </div>
            <button type="button" className="nav-logout" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="nav-signin">
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
