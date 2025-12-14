/* FocusFlow Frontend (vanilla HTML/JS)
   - Talks to the provided .NET Web API
   - Stores the signed-in user in localStorage
*/

const API_BASE = "http://localhost:5277/api/Users";

const storage = {
  getUser() {
    try { return JSON.parse(localStorage.getItem("ff_user") || "null"); }
    catch { return null; }
  },
  setUser(user) {
    localStorage.setItem("ff_user", JSON.stringify(user));
  },
  clearUser() {
    localStorage.removeItem("ff_user");
  }
};

function $(sel) { return document.querySelector(sel); }
function $all(sel) { return Array.from(document.querySelectorAll(sel)); }

function setActiveNav() {
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  $all('[data-nav]').forEach(a => {
    const target = (a.getAttribute("href") || "").toLowerCase();
    a.classList.toggle("active", target.endsWith(path));
  });
}

function renderNav() {
  const user = storage.getUser();
  const nav = $("#nav-links");
  if (!nav) return;

  const links = user
    ? [
        ["Home", "index.html"],
        ["Dashboard", "dashboard.html"],
        ["Tasks", "tasks.html"],
        ["Timer", "timer.html"],
        ["Reports", "reports.html"],
        ["Settings", "settings.html"]
      ]
    : [
        ["Home", "index.html"],
        ["Login", "login.html"],
        ["Register", "register.html"]
      ];

  nav.innerHTML = links
    .map(([label, href]) => `<a class="pill" data-nav href="${href}">${label}</a>`)
    .join("");

  const right = $("#nav-actions");
  if (right) {
    right.innerHTML = user
      ? `<span class="pill">Hi, ${escapeHtml(user.firstName || "User")}</span>
         <button class="btn btn-danger" id="logoutBtn" type="button">Log out</button>`
      : `<a class="btn btn-primary" href="login.html">Get started</a>`;
  }

  $("#logoutBtn")?.addEventListener("click", () => {
    storage.clearUser();
    location.href = "login.html";
  });

  setActiveNav();
}

function requireAuth() {
  const user = storage.getUser();
  if (!user?.id) location.href = "login.html";
  return user;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[m]));
}

async function apiFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const headers = Object.assign({ "Content-Type": "application/json" }, options.headers || {});
  const res = await fetch(url, { ...options, headers });

  // Helpful error payload (backend sometimes returns strings, sometimes JSON)
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text || null; }

  if (!res.ok) {
    const msg =
      typeof data === "string" && data.trim()
        ? data
        : (data?.title || data?.message || res.statusText || "Request failed");
    throw new Error(msg);
  }
  return data;
}

function setNotice(el, message, kind = "ok") {
  if (!el) return;
  el.className = `notice ${kind === "bad" ? "bad" : "ok"}`;
  el.textContent = message;
}

document.addEventListener("DOMContentLoaded", () => {
  renderNav();
});
