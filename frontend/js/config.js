// Auto-detect API base URL: use same origin in production, localhost in dev
const API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:5000"
  : window.location.origin;
