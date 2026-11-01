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

    currentUser = { id: 'user-' + email.replace(/[^a-zA-Z0-9]/g, ''), fullName: email.split('@')[0], email, role: 'STUDENT' };
    currentAuthToken = 'token-' + currentUser.id;
    localStorage.setItem('student_task_user', JSON.stringify(currentUser));
    localStorage.setItem('student_task_token', currentAuthToken);
    showDashboard();
}

async function handleRegister(e) {
    e.preventDefault();
    const fullName = document.getElementById('regFullName').value;
    const email = document.getElementById('regEmail').value;
    
    alert('Registration successful for ' + fullName + '! Please log in.');
    switchTab('login');
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

function loadTasks() {
    let tasks = JSON.parse(localStorage.getItem('tasks_' + currentUser.id)) || [
        { id: '1', title: 'Welcome Task: Explore Dashboard', course: 'Orientation', priority: 'MEDIUM', status: 'TODO', dueDate: '2026-11-10' }
    ];
    renderKanban(tasks);
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

function handleCreateTask(e) {
    e.preventDefault();
    const title = document.getElementById('taskTitle').value;
    const course = document.getElementById('taskCourse').value;
    const priority = document.getElementById('taskPriority').value;
    const dueDate = document.getElementById('taskDueDate').value;

    let tasks = JSON.parse(localStorage.getItem('tasks_' + currentUser.id)) || [];
    tasks.push({ id: 'task-' + Date.now(), title, course, priority, status: 'TODO', dueDate });
    localStorage.setItem('tasks_' + currentUser.id, JSON.stringify(tasks));
    
    document.getElementById('taskForm').reset();
    loadTasks();
}

function shiftTaskStatus(id, currentStatus) {
    const statuses = ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'];
    const nextStatus = statuses[(statuses.indexOf(currentStatus) + 1) % statuses.length];

    let tasks = JSON.parse(localStorage.getItem('tasks_' + currentUser.id)) || [];
    tasks = tasks.map(t => t.id === id ? { ...t, status: nextStatus } : t);
    localStorage.setItem('tasks_' + currentUser.id, JSON.stringify(tasks));
    loadTasks();
}

function deleteTask(id) {
    let tasks = JSON.parse(localStorage.getItem('tasks_' + currentUser.id)) || [];
    tasks = tasks.filter(t => t.id !== id);
    localStorage.setItem('tasks_' + currentUser.id, JSON.stringify(tasks));
    loadTasks();
}
