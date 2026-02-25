// ─────────────────────────────────────────────────────────
//  App.jsx  ← root of the React app
//
//  Responsibilities:
//  1. Checks if user is already logged in (on every page load)
//  2. Holds the `user` state and passes it to pages that need it
//  3. Defines all page routes
// ─────────────────────────────────────────────────────────

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import Navbar      from "./components/Navbar";
import Home        from "./pages/Home";
import BookDetails from "./pages/BookDetails";
import Login       from "./pages/Login";
import Shelves     from "./pages/Shelves";
import Profile     from "./pages/Profile";

function App() {
  const [user, setUser]               = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // On first load, ask the backend "is anyone logged in?"
  // The cookie is sent automatically so the backend can verify
  useEffect(() => {
    fetch("/auth/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setAuthLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch("/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
  };

  return (
    <BrowserRouter>
      {/* Navbar is always visible on every page */}
      <Navbar user={user} authLoading={authLoading} onLogout={handleLogout} />

      <Routes>
        {/* Public pages */}
        <Route path="/"         element={<Home user={user} />} />
        <Route path="/books/:id" element={<BookDetails user={user} />} />
        <Route path="/login"    element={<Login user={user} />} />

        {/* Pages that require login */}
        <Route path="/shelves"  element={<Shelves user={user} />} />
        <Route path="/profile"  element={<Profile user={user} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
