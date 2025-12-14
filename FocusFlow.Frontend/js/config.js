// js/config.js
// Central configuration + tiny auth helpers for FocusFlow frontend.

// If your frontend is served by the SAME ASP.NET app (recommended), leave as "".
window.API_BASE = "";

// Where we store the logged-in user (from POST /api/Users/login response)
const USER_KEY = "focusflow.user";

window.setUser = function(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

window.getUser = function() {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); }
  catch { return null; }
};

window.getUserId = function() {
  const u = window.getUser();
  if (!u) return null;
  // handle either {id: 1} or {Id: 1}
  return u.id ?? u.Id ?? null;
};

window.requireUserId = function() {
  const id = window.getUserId();
  if (!id) {
    window.location.href = "login.html";
    return null;
  }
  return id;
};

window.logout = function() {
  localStorage.removeItem(USER_KEY);
  window.location.href = "login.html";
};
