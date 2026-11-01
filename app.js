let currentUser = JSON.parse(localStorage.getItem('student_task_user')) || null;
let currentAuthToken = localStorage.getItem('student_task_token') || null;

document.addEventListener('DOMContentLoaded', () => {
    // Check if "Remember Me" saved credentials exist and pre-fill them
    const savedEmail = localStorage.getItem('student_task_remembered_email');
    const savedPass = localStorage.getItem('student_task_remembered_pass');
    if (savedEmail && document.getElementById('loginEmail')) {
        document.getElementById('loginEmail').value = savedEmail;
        document.getElementById('loginPassword').value = savedPass || '';
        const rememberCheckbox = document.getElementById('rememberMe');
        if (rememberCheckbox) rememberCheckbox.checked = true;
    }

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

// REGISTER: Saves user accounts securely in localStorage
function handleRegister(e) {
    e.preventDefault();
    const fullName = document.getElementById('regFullName').value;
    const email = document.getElementById('regEmail').value.trim().toLowerCase();
    const password = document.getElementById('regPassword').value;

    let registeredUsers = JSON.parse(localStorage.getItem('student_task_registered_users')) || [];
    
    const existingUser = registeredUsers.find(u => u.email === email);
    if (existingUser) {
        alert('This email is already registered! Please log in instead.');
        switchTab('login');
        return;
    }

    registeredUsers.push({ fullName, email, password });
    localStorage.setItem('student_task_registered_users', JSON.stringify(registeredUsers));

    alert('Registration successful! You can now log in with your credentials.');
    document.getElementById('registerForm').reset();
    switchTab('login');
}

// LOGIN: Validates credentials and remembers them if checked
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe') ? document.getElementById('rememberMe').checked : false;

    let registeredUsers = JSON.parse(localStorage.getItem('student_task_registered_users')) || [];
    const validUser = registeredUsers.find(u => u.email === email && u.password === password);

    if (!validUser) {
        alert('Invalid email or password! Please check your credentials or register first.');
        return;
    }

    // Handle Remember Me storage
    if (rememberMe) {
        localStorage.setItem('student_task_remembered_email', email);
        localStorage.setItem('student_task_remembered_pass', password);
    } else {
        localStorage.removeItem('student_task_remembered_email');
        localStorage.removeItem('student_task_remembered_pass');
    }

    currentUser = { id: 'user-' + email.replace(/[^a-zA-Z0-9]/g, ''), fullName: validUser.fullName, email: validUser.email };
    currentAuthToken = 'token-' + currentUser.id;

    localStorage.setItem('student_task_user', JSON.stringify(currentUser));
    localStorage.setItem('student_task_token', currentAuthToken);

    showDashboard();
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
