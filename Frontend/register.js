document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const notice = document.getElementById("notice");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    notice.style.display = "none";

    const FirstName = document.getElementById("firstName").value.trim();
    const LastName = document.getElementById("lastName").value.trim();
    const Email = document.getElementById("email").value.trim();
    const pw1 = document.getElementById("password").value;
    const pw2 = document.getElementById("password2").value;

    if (!FirstName || !LastName || !Email || !pw1) {
      notice.style.display = "block";
      setNotice(notice, "Please fill in all fields.", "bad");
      return;
    }
    if (pw1 !== pw2) {
      notice.style.display = "block";
      setNotice(notice, "Passwords do not match.", "bad");
      return;
    }

    try {
      await apiFetch("", {
        method: "POST",
        body: JSON.stringify({
          FirstName,
          LastName,
          Email,
          PasswordHash: pw1
        })
      });

      notice.style.display = "block";
      setNotice(notice, "Account created. You can log in now.", "ok");

      setTimeout(() => (location.href = "login.html"), 700);
    } catch (err) {
      notice.style.display = "block";
      setNotice(notice, `Sign up failed: ${err.message}`, "bad");
    }
  });
});
