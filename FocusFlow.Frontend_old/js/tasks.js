document.addEventListener('DOMContentLoaded', async () => {
    const userId = requireUser();
    const form = document.getElementById('task-form');
    const tableBody = document.querySelector('#tasks-table tbody');

    async function loadTasks() {
        const res = await fetch(`${API_BASE}/users/${userId}/tasks`);
        const tasks = await res.json();
        tableBody.innerHTML = '';
        tasks.forEach(t => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${t.title}</td>
                <td>${t.category || ''}</td>
                <td>${t.priority}</td>
                <td>${t.status}</td>
                <td>${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : ''}</td>
                <td>${t.estimatedMinutes || ''}</td>
                <td>
                    <button data-id="${t.id}" class="edit-btn">Edit</button>
                    <button data-id="${t.id}" class="delete-btn">Delete</button>
                </td>`;
            tableBody.appendChild(tr);
        });
    }

    form.addEventListener('submit', async e => {
        e.preventDefault();
        const id = document.getElementById('task-id').value;
        const dto = {
            title: document.getElementById('task-title').value,
            category: document.getElementById('task-category').value,
            priority: document.getElementById('task-priority').value,
            status: document.getElementById('task-status').value,
            dueDate: document.getElementById('task-dueDate').value || null,
            estimatedMinutes: document.getElementById('task-estimated').value
                ? Number(document.getElementById('task-estimated').value)
                : null
        };

        const method = id ? 'PUT' : 'POST';
        const url = id
            ? `${API_BASE}/users/${userId}/tasks/${id}`
            : `${API_BASE}/users/${userId}/tasks`;

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dto)
        });

        form.reset();
        document.getElementById('task-id').value = '';
        await loadTasks();
    });

    tableBody.addEventListener('click', async e => {
        const btn = e.target;
        if (!(btn instanceof HTMLButtonElement)) return;
        const id = btn.getAttribute('data-id');

        if (btn.classList.contains('delete-btn')) {
            await fetch(`${API_BASE}/users/${userId}/tasks/${id}`, {
                method: 'DELETE'
            });
            await loadTasks();
        }

        if (btn.classList.contains('edit-btn')) {
            const res = await fetch(`${API_BASE}/users/${userId}/tasks/${id}`);
            const t = await res.json();
            document.getElementById('task-id').value = t.id;
            document.getElementById('task-title').value = t.title;
            document.getElementById('task-category').value = t.category || '';
            document.getElementById('task-priority').value = t.priority;
            document.getElementById('task-status').value = t.status;
            document.getElementById('task-dueDate').value = t.dueDate ? t.dueDate.substring(0,10) : '';
            document.getElementById('task-estimated').value = t.estimatedMinutes || '';
        }
    });

    await loadTasks();
});
