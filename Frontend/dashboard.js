const userId = localStorage.getItem('currentUserId');
const taskListElement = document.getElementById('taskList');
const addTaskForm = document.getElementById('addTaskForm');
const formMessage = document.getElementById('form-message');
const statusMessage = document.getElementById('auth-status');

const API_BASE = 'http://localhost:5277/api/Users';

document.addEventListener('DOMContentLoaded', () => {
    if (!userId) {
        statusMessage.textContent = 'User ID not found. Please log in.';
        // Redirect if not authenticated (best practice)
        window.location.href = 'index.html'; 
        return;
    }
    statusMessage.textContent = `User authenticated (ID: ${userId}). Loading tasks...`;
    fetchTasks();
});

// --- 1. GET ALL USER TASKS ---
async function fetchTasks() {
    taskListElement.innerHTML = ''; // Clear existing tasks
    try {
        const response = await fetch(`${API_BASE}/${userId}/Tasks`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const tasks = await response.json();
        
        if (tasks.length === 0) {
            taskListElement.innerHTML = '<li>You have no tasks! Time to create one.</li>';
        } else {
            tasks.forEach(task => displayTask(task));
        }
    } catch (error) {
        taskListElement.innerHTML = `<li>Error loading tasks: ${error.message}</li>`;
        console.error("Fetch tasks failed:", error);
    }
}

function displayTask(task) {
    const listItem = document.createElement('li'); 
    
    const taskStatus = task.status?.toLowerCase() ?? 'open'; 
    
    listItem.className = taskStatus === 'done' ? 'task-done' : 'task-open';
    
    const dueDateText = task.dueDate ? ` (Due: ${new Date(task.dueDate).toLocaleDateString()})` : '';
    let taskDetails = `${task.title} - Priority: ${task.priority}${dueDateText}`;

    if (taskStatus !== 'done') {
        const completeButton = document.createElement('button');
        completeButton.textContent = 'Complete Task';
        completeButton.className = 'complete-button'; 
        completeButton.onclick = () => completeTask(task.id); // Note: using task.id (lowercase i)
        
        listItem.innerHTML = `<strong>${taskDetails}</strong> [Status: ${task.status}]`;
        listItem.appendChild(completeButton);
    } else {
        const completionDate = new Date(task.completionDate).toLocaleDateString();
        listItem.innerHTML = `✅ <strike><strong>${task.title}</strong></strike> (Completed: ${completionDate})`;
    }

    // 6. Append the list item to the task list
    taskListElement.appendChild(listItem);
}


async function completeTask(taskId) {
    try {
        const response = await fetch(`${API_BASE}/${userId}/Tasks/${taskId}/Complete`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json' 
            }
        });

        if (response.status === 204 || response.ok) { 
            formMessage.textContent = `Task ID ${taskId} marked as complete!`;
            formMessage.style.color = 'green';
            fetchTasks(); 
        } else {
            throw new Error(`Failed to complete task. Status: ${response.status}`);
        }
    } catch (error) {
        formMessage.textContent = `Error completing task: ${error.message}`;
        formMessage.style.color = 'red';
        console.error("Complete task failed:", error);
    }
}


addTaskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    formMessage.textContent = 'Creating task...';
    formMessage.style.color = 'blue';

    const newTask = {
        title: document.getElementById('taskTitle').value,
        priority: parseInt(document.getElementById('taskPriority').value),
        category: document.getElementById('taskCategory').value,
        estimatedTime: document.getElementById('taskEstimatedTime').value || null 
    };

    try {
        const response = await fetch(`${API_BASE}/${userId}/Tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newTask)
        });

        if (response.status === 201) { // 201 Created is typical for a successful POST
            const createdTask = await response.json();
            formMessage.textContent = `Task "${createdTask.Title}" created successfully!`;
            formMessage.style.color = 'green';
            addTaskForm.reset(); // Clear the form
            fetchTasks(); // Reload the task list
        } else {
            const errorData = await response.json();
            throw new Error(errorData.title || `Failed to create task. Status: ${response.status}`);
        }

    } catch (error) {
        formMessage.textContent = `Error creating task: ${error.message}`;
        formMessage.style.color = 'red';
        console.error("Create task failed:", error);
    }
});