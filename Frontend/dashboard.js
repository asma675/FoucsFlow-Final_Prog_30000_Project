document.addEventListener("DOMContentLoaded", async () => {
  const user = requireAuth();
  const notice = document.getElementById("dashNotice");

  try {
    const tasks = await apiFetch(`/${user.id}/Tasks`, { method: "GET" }) || [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const isDone = (t) => (t.status || "").toLowerCase() === "completed" || t.completionDate;
    const isOpen = (t) => !isDone(t);

    const dueDate = (t) => t.dueDate ? new Date(t.dueDate) : null;

    const total = tasks.length;
    const done = tasks.filter(isDone).length;
    const open = total - done;

    const dueSoon = tasks.filter(t => {
      const d = dueDate(t);
      if (!d || isDone(t)) return false;
      const diffDays = (d - now) / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 3;
    }).length;

    // streak: count consecutive days ending today with at least one completion
    const doneDates = tasks
      .filter(isDone)
      .map(t => (t.completionDate ? new Date(t.completionDate) : null))
      .filter(Boolean)
      .map(d => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime());
    const doneSet = new Set(doneDates);

    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const day = new Date(startOfToday);
      day.setDate(day.getDate() - i);
      if (doneSet.has(day.getTime())) streak++;
      else break;
    }

    document.getElementById("kpiTotal").textContent = total;
    document.getElementById("kpiOpen").textContent = open;
    document.getElementById("kpiDone").textContent = done;
    document.getElementById("kpiDueSoon").textContent = dueSoon;
    document.getElementById("kpiStreak").textContent = streak;

    const today = tasks
      .filter(t => {
        const d = dueDate(t);
        if (!d || isDone(t)) return false;
        return d < endOfToday;
      })
      .sort((a,b) => (dueDate(a) || 0) - (dueDate(b) || 0));

    const recent = tasks
      .filter(isDone)
      .sort((a,b) => (new Date(b.completionDate || 0)) - (new Date(a.completionDate || 0)))
      .slice(0,5);

    renderMiniList(document.getElementById("todayList"), today, "No tasks due today.");
    renderMiniList(document.getElementById("recentDone"), recent, "No completed tasks yet.", true);

  } catch (err) {
    notice.style.display = "block";
    setNotice(notice, `Couldn’t load dashboard: ${err.message}`, "bad");
  }
});

function renderMiniList(host, items, emptyText, doneList=false) {
  if (!host) return;
  if (!items.length) {
    host.innerHTML = `<div class="notice">${emptyText}</div>`;
    return;
  }
  host.innerHTML = items.map(t => {
    const badge = doneList ? "ok" : "open";
    const due = t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "No due date";
    return `<div class="row" style="justify-content:space-between; padding:10px 0; border-bottom:1px solid rgba(255,255,255,.08);">
      <div>
        <div style="font-weight:700;">${escapeHtml(t.title || "Untitled")}</div>
        <div style="color:rgba(234,230,255,.74); font-size:13px;">${escapeHtml(t.category || "General")} • ${due}</div>
      </div>
      <span class="badge ${badge}">${doneList ? "Done" : "Open"}</span>
    </div>`;
  }).join("");
}
