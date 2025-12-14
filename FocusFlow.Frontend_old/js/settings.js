document.addEventListener('DOMContentLoaded', async () => {
    const userId = requireUser();
    const form = document.getElementById('settings-form');
    const msg = document.getElementById('settings-message');

    async function load() {
        const res = await fetch(`${API_BASE}/users/${userId}/settings`);
        if (!res.ok) return;
        const s = await res.json();
        document.getElementById('work-duration').value = s.workDurationMinutes;
        document.getElementById('break-duration').value = s.breakDurationMinutes;
        document.getElementById('notifications-enabled').checked = s.notificationsEnabled;
        document.getElementById('language').value = s.language;
    }

    form.addEventListener('submit', async e => {
        e.preventDefault();
        const body = {
            userId,
            workDurationMinutes: Number(document.getElementById('work-duration').value),
            breakDurationMinutes: Number(document.getElementById('break-duration').value),
            notificationsEnabled: document.getElementById('notifications-enabled').checked,
            language: document.getElementById('language').value
        };

        const res = await fetch(`${API_BASE}/users/${userId}/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        msg.textContent = res.ok ? 'Settings saved.' : 'Error saving settings.';
    });

    await load();
});
