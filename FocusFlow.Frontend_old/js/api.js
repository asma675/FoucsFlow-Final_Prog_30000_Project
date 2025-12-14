// js/api.js
// Change this later to your real API endpoint if/when backend is deployed.
const API_BASE = "https://localhost:5001/api";

// Simple "demo / guest" user support.
// If no user is stored, we default to userId = 1 so the app still works.
function getUserId() {
  const stored = localStorage.getItem("userId");
  return stored ? Number(stored) : 1; // guest user
}

function setUser(user) {
  const id = user && user.userId ? user.userId : 1;
  localStorage.setItem("userId", String(id));
  if (user && user.username) {
    localStorage.setItem("username", user.username);
  }
}

// Kept for compatibility, but now it DOES NOT block or redirect.
// It just returns a usable userId (guest if not logged in).
function requireUser() {
  return getUserId();
}
