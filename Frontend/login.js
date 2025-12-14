document.addEventListener("DOMContentLoaded", () => {
  const user = storage.getUser();
  if (user?.id) location.href = "dashboard.html";

  const form = document.getElementById("loginForm");
  const notice = document.getElementById("notice");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    notice.style.display = "none";

    const Email = document.getElementById("email").value.trim();
    const PasswordHash = document.getElementById("password").value;

    if (!Email || !PasswordHash) {
      notice.style.display = "block";
      setNotice(notice, "Please enter your email and password.", "bad");
      return;
    }

    try {
      const data = await apiFetch("/login", {
        method: "POST",
        body: JSON.stringify({ Email, PasswordHash })
      });

      // Keep only what we need in local storage
      storage.setUser({
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email
      });

      location.href = "dashboard.html";
    } catch (err) {
      notice.style.display = "block";
      setNotice(notice, `Login failed: ${err.message}`, "bad");
    }
  });
});
