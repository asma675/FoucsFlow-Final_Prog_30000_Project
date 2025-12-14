// js/auth.js
// Uses endpoints from endpoints.pdf:
// - POST /api/Users (register)
// - POST /api/Users/login (login)

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  async function jsonRequest(path, bodyObj) {
    const res = await fetch(`${window.API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyObj),
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      const msg = (data && (data.message || data.error)) || text || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return data;
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("login-email").value.trim();
      const passwordHash = document.getElementById("login-password").value.trim();

      const msg = document.getElementById("login-message");
      msg.textContent = "";

      try {
        const user = await jsonRequest("/api/Users/login", { email, passwordHash });
        window.setUser(user);
        window.location.href = "tasks.html";
      } catch (err) {
        msg.textContent = err.message || "Login failed.";
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const firstName = document.getElementById("reg-firstName").value.trim();
      const lastName = document.getElementById("reg-lastName").value.trim();
      const email = document.getElementById("reg-email").value.trim();
      const passwordHash = document.getElementById("reg-password").value.trim();

      const msg = document.getElementById("register-message");
      msg.textContent = "";

      try {
        const user = await jsonRequest("/api/Users", { firstName, lastName, email, passwordHash });
        window.setUser(user);
        window.location.href = "tasks.html";
      } catch (err) {
        msg.textContent = err.message || "Registration failed.";
      }
    });
  }

  // Wire logout button if present
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => window.logout());
  }
});
