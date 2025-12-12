document.addEventListener('DOMContentLoaded', async () => {
    const userId = getUserId(); // guest-safe
  
    const res = await fetch(`${API_BASE}/users/${userId}/dashboard/daily-summary`);
    if (!res.ok) return;

    const summary = await res.json();
    document.getElementById('summary-date').textContent = new Date(summary.date).toDateString();
    document.getElementById('summary-pomodoros').textContent = summary.totalPomodoros;
    document.getElementById('summary-work').textContent = summary.totalWorkMinutes;
    document.getElementById('summary-created').textContent = summary.tasksCreated;
    document.getElementById('summary-completed').textContent = summary.tasksCompleted;
    document.getElementById('summary-streak').textContent = summary.currentStreakDays;
});
