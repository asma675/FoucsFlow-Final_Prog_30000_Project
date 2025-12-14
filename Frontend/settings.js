document.addEventListener("DOMContentLoaded", () => {
  const user = requireAuth();
  document.getElementById("who").textContent = `${user.firstName || ""} ${user.lastName || ""} • ${user.email || ""}`.trim();

  document.getElementById("logout").addEventListener("click", () => {
    storage.clearUser();
    location.href = "login.html";
  });

  const notice = document.getElementById("notice");

  document.getElementById("clearSessions").addEventListener("click", () => {
    localStorage.removeItem("ff_sessions");
    notice.style.display = "block";
    setNotice(notice, "Timer sessions cleared.", "ok");
  });
});
