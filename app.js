let currentUser = JSON.parse(localStorage.getItem('student_task_user')) || null;
let currentAuthToken = localStorage.getItem('student_task_token') || null;

document.addEventListener('DOMContentLoaded', () => {
    if (currentUser && currentAuthToken) {
        showDashboard();
    } else {
        showAuth();
    }
});

function switchTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginBtn = document.getElementById('tabLoginBtn');
    const regBtn = document.getElementById('tabRegisterBtn');

    if (tab === 'login') {
        loginForm.style.display = 'flex';
        registerForm.style.display = 'none';
        loginBtn.classList.add('active');
        regBtn.classList.remove('active');
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'flex';
        regBtn.classList.add('active');
        loginBtn.classList.remove('active');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const res = await fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
            currentUser = data.user;
            currentAuthToken = data.token;
            localStorage.setItem('student_task_user', JSON.stringify(currentUser));
            localStorage.setItem('student_task_token', currentAuthToken);
            showDashboard();
        } else {
            alert(data.error || 'Login failed');
        }
    } catch (err) {
        // Fallback for offline static testing
        currentUser = { id: 'user-offline', fullName: email.split('@')[0], email, role: 'STUDENT' };
        currentAuthToken = 'offline-token';
        localStorage.setItem('student_task_user', JSON.stringify(currentUser));
        localStorage.setItem('student_task_token', currentAuthToken);
        showDashboard();
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const fullName = document.getElementById('regFullName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const role = document.getElementById('regRole').value;

    try {
        const res = await fetch('/api/v1/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, email, password, role })
        });
        const data = await res.json();
        if (res.ok) {
            alert('Registration successful! Please log in.');
            switchTab('login');
        } else {
            alert(data.error || 'Registration failed');
        }
    } catch (err) {
        alert('Registered successfully in offline mode!');
        switchTab('login');
    }
}

function handleLogout() {
    currentUser = null;
    currentAuthToken = null;
    localStorage.removeItem('student_task_user');
    localStorage.removeItem('student_task_token');
    showAuth();
}

function showAuth() {
    document.getElementById('authContainer').style.display = 'flex';
    document.getElementById('dashboardContainer').style.display = 'none';
}

function showDashboard() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('dashboardContainer').style.display = 'flex';
    document.getElementById('userNameDisplay').textContent = currentUser.fullName || 'Student';
    loadTasks();
}

async function loadTasks() {
    try {
        const res = await fetch('/api/v1/tasks', {
            headers: { 'Authorization': currentAuthToken }
        });
        let tasks = await res.json();
        if (!Array.isArray(tasks)) tasks = [];
        renderKanban(tasks);
    } catch (err) {
        // LocalStorage fallback
        let tasks = JSON.parse(localStorage.getItem('tasks_' + currentUser.id)) || [
            { id: '1', title: 'MCA1005 Final Report', course: 'MCA1005', priority: 'URGENT', status: 'TODO', dueDate: '2026-10-31' },
            { id: '2', title: 'Kanban Board UI Component', course: 'MCA1005', priority: 'HIGH', status: 'IN_PROGRESS', dueDate: '2026-11-02' }
        ];
        renderKanban(tasks);
    }
}

function renderKanban(tasks) {
    const statuses = ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'];
    statuses.forEach(status => {
        const container = document.getElementById(`list-${status}`);
        const countSpan = document.querySelector(`span[count-status="${status}"]`);
        if (container) container.innerHTML = '';
        
        const filtered = tasks.filter(t => t.status === status);
        if (countSpan) countSpan.textContent = filtered.length;

        filtered.forEach(task => {
            const card = document.createElement('div');
            card.className = 'task-card';
            card.innerHTML = `
                <h4>${task.title}</h4>
                <p><strong>${task.course}</strong> | Priority: ${task.priority}<br>Due: ${task.dueDate}</p>
                <div class="task-actions">
                    <button onclick="shiftTaskStatus('${task.id}', '${task.status}')">Next ➡️</button>
                    <button onclick="deleteTask('${task.id}')" style="color: red;">Delete</button>
                </div>
            `;
            if (container) container.appendChild(card);
        });
    });
}

async function handleCreateTask(e) {
    e.preventDefault();
    const title = document.getElementById('taskTitle').value;
    const course = document.getElementById('taskCourse').value;
    const priority = document.getElementById('taskPriority').value;
    const dueDate = document.getElementById('taskDueDate').value;

    const newTask = { title, course, priority, dueDate, userId: currentUser.id };

    try {
        const res = await fetch('/api/v1/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': currentAuthToken },
            body: JSON.stringify(newTask)
        });
        if (res.ok) {
            document.getElementById('taskForm').reset();
            loadTasks();
        }
    } catch (err) {
        // Fallback
        let tasks = JSON.parse(localStorage.getItem('tasks_' + currentUser.id)) || [];
        tasks.push({ id: 'task-' + Date.now(), ...newTask, status: 'TODO' });
        localStorage.setItem('tasks_' + currentUser.id, JSON.stringify(tasks));
        document.getElementById('taskForm').reset();
        loadTasks();
    }
}

async function shiftTaskStatus(id, currentStatus) {
    const statuses = ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'];
    const nextStatus = statuses[(statuses.indexOf(currentStatus) + 1) % statuses.length];

    try {
        await fetch(`/api/v1/tasks/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: nextStatus })
        });
        loadTasks();
    } catch (err) {
        let tasks = JSON.parse(localStorage.getItem('tasks_' + currentUser.id)) || [];
        tasks = tasks.map(t => t.id === id ? { ...t, status: nextStatus } : t);
        localStorage.setItem('tasks_' + currentUser.id, JSON.stringify(tasks));
        loadTasks();
    }
}

async function deleteTask(id) {
    try {
        await fetch(`/api/v1/tasks/${id}`, { method: 'DELETE' });
        loadTasks();
    } catch (err) {
        let tasks = JSON.parse(localStorage.getItem('tasks_' + currentUser.id)) || [];
        tasks = tasks.filter(t => t.id !== id);
        localStorage.setItem('tasks_' + currentUser.id, JSON.stringify(tasks));
        loadTasks();
    }
}
