document.addEventListener('DOMContentLoaded', () => {
    const userId = requireUser();
    const list = document.getElementById('report-list');
    const button = document.getElementById('refresh-report');

    async function load() {
        const res = await fetch(`${API_BASE}/users/${userId}/dashboard/daily-summary`);
        if (!res.ok) return;
        const s = await res.json();
        list.innerHTML = '';
        const items = [
            `Total Pomodoros: ${s.totalPomodoros}`,
            `Total Work Minutes: ${s.totalWorkMinutes}`,
            `Tasks Created: ${s.tasksCreated}`,
            `Tasks Completed: ${s.tasksCompleted}`,
            `Current Streak: ${s.currentStreakDays} days`
        ];
        items.forEach(text => {
            const li = document.createElement('li');
            li.textContent = text;
            list.appendChild(li);
        });
    }

    button.addEventListener('click', load);
    load();
});
