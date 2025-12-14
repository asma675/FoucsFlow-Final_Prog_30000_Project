document.addEventListener("DOMContentLoaded", () => {
  const user = requireAuth();
  document.getElementById("refreshBtn").addEventListener("click", () => loadReports(user.id));
  loadReports(user.id);
});

async function loadReports(userId) {
  const notice = document.getElementById("notice");
  notice.style.display = "none";

  try {
    const tasks = await apiFetch(`/${userId}/Tasks`, { method: "GET" }) || [];

    const byCat = {};
    for (const t of tasks) {
      const c = (t.category || "Other").trim() || "Other";
      byCat[c] = (byCat[c] || 0) + 1;
    }

    renderBars(byCat);

    // week stats
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 6);
    weekStart.setHours(0,0,0,0);

    const isDone = (t) => (t.status || "").toLowerCase() === "completed" || t.completionDate;
    const doneThisWeek = tasks.filter(t => isDone(t) && t.completionDate && new Date(t.completionDate) >= weekStart).length;

    document.getElementById("weekDone").textContent = doneThisWeek;

    const sessions = loadSessions();
    const mins = sessions
      .filter(s => new Date(s.endedAt) >= weekStart)
      .reduce((sum, s) => sum + Number(s.minutes || 0), 0);

    document.getElementById("weekMins").textContent = mins;

  } catch (err) {
    notice.style.display = "block";
    setNotice(notice, `Couldn’t load reports: ${err.message}`, "bad");
  }
}

function renderBars(map) {
  const host = document.getElementById("catBars");
  const entries = Object.entries(map).sort((a,b) => b[1]-a[1]);
  if (!entries.length) {
    host.innerHTML = `<div class="notice">No tasks yet — add a few and come back.</div>`;
    return;
  }
  const max = Math.max(...entries.map(e => e[1]));
  host.innerHTML = entries.map(([label, value]) => {
    const pct = max ? Math.round((value / max) * 100) : 0;
    return `<div style="margin:10px 0;">
      <div class="row" style="justify-content:space-between;">
        <div style="font-weight:800;">${escapeHtml(label)}</div>
        <div style="color:rgba(234,230,255,.72);">${value}</div>
      </div>
      <div style="height:10px; border-radius:999px; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.10); overflow:hidden; margin-top:6px;">
        <div style="height:100%; width:${pct}%; background:linear-gradient(90deg, rgba(168,85,247,.95), rgba(34,211,238,.70));"></div>
      </div>
    </div>`;
  }).join("");
}

function loadSessions() {
  try { return JSON.parse(localStorage.getItem("ff_sessions") || "[]"); }
  catch { return []; }
}
