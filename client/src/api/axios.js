// ─────────────────────────────────────────────────────────
//  api/axios.js
//
//  A pre-configured axios instance we reuse everywhere.
//  baseURL: "/api" so we only write e.g. "/books" in pages
//  withCredentials: true so cookies are sent with every request
// ─────────────────────────────────────────────────────────

import axios from "axios";

const API = axios.create({
  baseURL: "/api",       // all requests go to /api/...
  withCredentials: true, // IMPORTANT: sends the auth cookie automatically
});

export default API;
