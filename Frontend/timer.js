document.addEventListener("DOMContentLoaded", () => {
  requireAuth();

  const minutesInput = document.getElementById("minutes");
  const labelInput = document.getElementById("label");
  const clock = document.getElementById("clock");
  const hint = document.getElementById("clockHint");
  const notice = document.getElementById("notice");

  const startBtn = document.getElementById("startBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const resetBtn = document.getElementById("resetBtn");

  let totalSeconds = Number(minutesInput.value || 25) * 60;
  let remaining = totalSeconds;
  let timerId = null;

  function renderClock() {
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    clock.textContent = `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  }

  function setReady() {
    totalSeconds = Number(minutesInput.value || 25) * 60;
    remaining = totalSeconds;
    renderClock();
    hint.textContent = "Ready when you are.";
  }

  minutesInput.addEventListener("change", () => {
    if (timerId) return;
    setReady();
  });

  startBtn.addEventListener("click", () => {
    notice.style.display = "none";

    if (timerId) return;
    if (remaining <= 0) setReady();

    hint.textContent = "Focusing…";

    timerId = setInterval(() => {
      remaining -= 1;
      renderClock();

      if (remaining <= 0) {
        clearInterval(timerId);
        timerId = null;
        hint.textContent = "Done. Nice work.";
        saveSession();
        notice.style.display = "block";
        setNotice(notice, "Session saved.", "ok");
      }
    }, 1000);
  });

  pauseBtn.addEventListener("click", () => {
    if (!timerId) return;
    clearInterval(timerId);
    timerId = null;
    hint.textContent = "Paused.";
  });

  resetBtn.addEventListener("click", () => {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
    setReady();
  });

  function saveSession() {
    const label = labelInput.value.trim() || "Focus session";
    const mins = Math.round(totalSeconds / 60);

    const sessions = loadSessions();
    sessions.unshift({
      label,
      minutes: mins,
      endedAt: new Date().toISOString()
    });
    localStorage.setItem("ff_sessions", JSON.stringify(sessions.slice(0, 50)));
    renderSessions();
  }

  function loadSessions() {
    try { return JSON.parse(localStorage.getItem("ff_sessions") || "[]"); }
    catch { return []; }
  }

  function renderSessions() {
    const sessions = loadSessions().slice(0,10);
    const host = document.getElementById("sessions");
    if (!sessions.length) {
      host.innerHTML = `<div class="notice">No sessions yet.</div>`;
      return;
    }
    host.innerHTML = sessions.map(s => {
      const when = new Date(s.endedAt).toLocaleString();
      return `<div class="row" style="justify-content:space-between; padding:10px 0; border-bottom:1px solid rgba(255,255,255,.08);">
        <div>
          <div style="font-weight:800;">${escapeHtml(s.label)}</div>
          <div style="color:rgba(234,230,255,.74); font-size:13px;">${escapeHtml(String(s.minutes))} min • ${escapeHtml(when)}</div>
        </div>
        <span class="badge open">Saved</span>
      </div>`;
    }).join("");
  }

  setReady();
  renderSessions();
});
