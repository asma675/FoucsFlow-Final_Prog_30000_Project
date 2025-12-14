let currentTasks = [];

document.addEventListener("DOMContentLoaded", () => {
  const user = requireAuth();

  document.getElementById("taskForm").addEventListener("submit", (e) => {
    e.preventDefault();
    createTask(user.id);
  });

  document.getElementById("refreshBtn").addEventListener("click", () => loadTasks(user.id));

  loadTasks(user.id);
});

async function loadTasks(userId) {
  const notice = document.getElementById("notice");
  notice.style.display = "none";

  try {
    const tasks = await apiFetch(`/${userId}/Tasks`, { method: "GET" }) || [];
    currentTasks = tasks.slice();

    const isDone = (t) => (t.status || "").toLowerCase() === "completed" || t.completionDate;
    const openCount = tasks.filter(t => !isDone(t)).length;
    const doneCount = tasks.length - openCount;

    document.getElementById("countOpen").textContent = `Open: ${openCount}`;
    document.getElementById("countDone").textContent = `Done: ${doneCount}`;

    renderTable(tasks, userId);
  } catch (err) {
    notice.style.display = "block";
    setNotice(notice, `Couldn’t load tasks: ${err.message}`, "bad");
  }
}

async function createTask(userId) {
  const notice = document.getElementById("notice");
  notice.style.display = "none";

  const Title = document.getElementById("title").value.trim();
  const Category = document.getElementById("category").value;
  const Priority = Number(document.getElementById("priority").value || 3);
  const DueDateRaw = document.getElementById("dueDate").value;
  const EstimatedTime = document.getElementById("est").value || null;

  if (!Title) {
    notice.style.display = "block";
    setNotice(notice, "Please enter a title.", "bad");
    return;
  }

  // Backend expects ISO date/time for DateTime? and TimeSpan string for EstimatedTime
  const payload = {
    Title,
    Category,
    Priority,
    DueDate: DueDateRaw ? new Date(DueDateRaw).toISOString() : null,
    EstimatedTime
  };

  try {
    await apiFetch(`/${userId}/Tasks`, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    document.getElementById("taskForm").reset();
    document.getElementById("priority").value = "3";

    notice.style.display = "block";
    setNotice(notice, "Task saved.", "ok");

    loadTasks(userId);
  } catch (err) {
    notice.style.display = "block";
    setNotice(notice, `Save failed: ${err.message}`, "bad");
  }
}

function renderTable(tasks, userId) {
  const rows = document.getElementById("taskRows");
  const isDone = (t) => (t.status || "").toLowerCase() === "completed" || t.completionDate;

  const sorted = tasks.slice().sort((a,b) => {
    // open first, then priority, then due date
    const aDone = isDone(a), bDone = isDone(b);
    if (aDone !== bDone) return aDone ? 1 : -1;
    if ((b.priority||0) !== (a.priority||0)) return (b.priority||0) - (a.priority||0);
    const ad = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    const bd = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    return ad - bd;
  });

  rows.innerHTML = sorted.map(t => {
    const due = t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—";
    const done = isDone(t);
    const badge = done ? `<span class="badge ok">Done</span>` : `<span class="badge open">Open</span>`;
    const action = done
      ? ""
      : `<button class="btn btn-primary" data-complete="${t.id}" type="button">Complete</button>`;
    return `<tr>
      <td style="font-weight:700;">${escapeHtml(t.title || "")}</td>
      <td>${escapeHtml(t.category || "")}</td>
      <td>${escapeHtml(String(t.priority ?? ""))}</td>
      <td>${escapeHtml(due)}</td>
      <td>${badge}</td>
      <td style="text-align:right;">${action}</td>
    </tr>`;
  }).join("");

  document.querySelectorAll("[data-complete]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const taskId = btn.getAttribute("data-complete");
      await completeTask(userId, taskId);
    });
  });
}

async function completeTask(userId, taskId) {
  const notice = document.getElementById("notice");
  notice.style.display = "none";

  try {
    await apiFetch(`/${userId}/Tasks/${taskId}/Complete`, { method: "PUT" });
    notice.style.display = "block";
    setNotice(notice, "Marked complete.", "ok");
    loadTasks(userId);
  } catch (err) {
    notice.style.display = "block";
    setNotice(notice, `Couldn’t complete task: ${err.message}`, "bad");
  }
}
