// js/tasks.js
// Uses endpoints from endpoints.pdf:
// - GET  /api/Users/{userId}/Tasks
// - POST /api/Users/{userId}/Tasks
// - PUT  /api/Users/{userId}/Tasks/{taskId}/Complete

document.addEventListener("DOMContentLoaded", () => {
  const userId = window.requireUserId();
  if (!userId) return;

  const tableBody = document.querySelector("#tasks-table tbody");
  const form = document.getElementById("task-form");

  const titleEl = document.getElementById("task-title");
  const categoryEl = document.getElementById("task-category");
  const priorityEl = document.getElementById("task-priority");
  const dueDateEl = document.getElementById("task-dueDate");
  const estEl = document.getElementById("task-estimated");

  function priorityToInt(label) {
    const v = (label || "").toLowerCase();
    if (v === "high") return 1;
    if (v === "medium") return 2;
    return 3; // low/default
  }

  // Accept "HH:MM:SS" or "HH:MM" or minutes like "90"
  function normalizeEstimatedTime(raw) {
    const s = (raw || "").trim();
    if (!s) return "00:30:00";

    if (/^\d+$/.test(s)) {
      const totalMin = parseInt(s, 10);
      const h = Math.floor(totalMin / 60);
      const m = totalMin % 60;
      return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0") + ":00";
    }

    if (/^\d{1,2}:\d{2}$/.test(s)) return s + ":00";
    if (/^\d{1,2}:\d{2}:\d{2}$/.test(s)) {
      const parts = s.split(":");
      return String(parts[0]).padStart(2,"0")+":"+parts[1]+":"+parts[2];
    }

    // fallback
    return "00:30:00";
  }

  async function api(path, options = {}) {
    const res = await fetch(`${window.API_BASE}${path}`, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options,
    });

    if (res.status === 204) return null;
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      const msg = (data && (data.message || data.error)) || text || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return data;
  }

  function render(tasks) {
    tableBody.innerHTML = "";

    if (!tasks || tasks.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="6" style="opacity:.75;">No tasks yet. Add one above.</td>`;
      tableBody.appendChild(tr);
      return;
    }

    tasks.forEach((t) => {
      const id = t.id ?? t.Id;
      const title = t.title ?? t.Title ?? "";
      const category = t.category ?? t.Category ?? "";
      const priority = t.priority ?? t.Priority ?? "";
      const status = t.status ?? t.Status ?? "";
      const due = t.dueDate ?? t.DueDate ?? null;

      const isDone = String(status).toLowerCase() === "done";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(title)}</td>
        <td>${escapeHtml(category)}</td>
        <td>${escapeHtml(String(priority))}</td>
        <td>${escapeHtml(status)}</td>
        <td>${due ? new Date(due).toLocaleDateString() : ""}</td>
        <td>
          <button class="btn btn-small" data-action="complete" data-id="${id}" ${isDone ? "disabled" : ""}>
            ${isDone ? "Done" : "Complete"}
          </button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  function escapeHtml(str) {
    return String(str || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  async function loadTasks() {
    const tasks = await api(`/api/Users/${userId}/Tasks`);
    render(tasks);
  }

  tableBody.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;
    const taskId = btn.dataset.id;

    try {
      if (action === "complete") {
        await api(`/api/Users/${userId}/Tasks/${taskId}/Complete`, { method: "PUT" });
        await loadTasks();
      }
    } catch (err) {
      alert(err.message || "Action failed.");
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = titleEl.value.trim();
    const category = categoryEl.value.trim();
    const priority = priorityToInt(priorityEl.value);
    const estimatedTime = normalizeEstimatedTime(estEl.value);
    const dueDate = dueDateEl.value ? new Date(dueDateEl.value).toISOString() : null;

    if (!title) return;

    const payload = { title, priority, category, estimatedTime };
    // include dueDate only if user entered it; backend can ignore if not supported
    if (dueDate) payload.dueDate = dueDate;

    try {
      await api(`/api/Users/${userId}/Tasks`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      form.reset();
      await loadTasks();
    } catch (err) {
      alert(err.message || "Could not create task.");
    }
  });

  // show who is logged in (if element exists)
  const who = document.getElementById("whoami");
  if (who) {
    const u = window.getUser();
    who.textContent = u ? (u.email ?? u.Email ?? "") : "";
  }

  loadTasks();
});
