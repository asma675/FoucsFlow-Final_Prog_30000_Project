// Auto-redirect if not logged in.
document.addEventListener('DOMContentLoaded', () => {
  const id = window.requireUserId();
  if (!id) return;
});
