const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Serve static frontend files from public folder
app.use(express.static(path.join(__dirname, '../public')));

// In-memory mock database for instant multi-user simulation & testing
let users = [
    { id: 'user-1', fullName: 'Demo Student', email: 'student@avantika.edu.in', password: 'password123', role: 'STUDENT' }
];

let tasks = [
    { id: 'task-1', userId: 'user-1', title: 'MCA1005 Final Report Submission', course: 'MCA1005', priority: 'URGENT', status: 'TODO', dueDate: '2026-10-31' },
    { id: 'task-2', userId: 'user-1', title: 'Kanban Board UI Component', course: 'MCA1005', priority: 'HIGH', status: 'IN_PROGRESS', dueDate: '2026-11-02' },
    { id: 'task-3', userId: 'user-1', title: 'PostgreSQL 3NF Schema Design', course: 'MCA1002', priority: 'HIGH', status: 'COMPLETED', dueDate: '2026-10-25' }
];

// Auth: Register
app.post('/api/v1/auth/register', (req, res) => {
    const { fullName, email, password, role } = req.body;
    if (!email || !password || !fullName) {
        return res.status(400).json({ error: 'All fields are required.' });
    }
    const existing = users.find(u => u.email === email);
    if (existing) {
        return res.status(400).json({ error: 'Email already registered.' });
    }
    const newUser = { id: 'user-' + Date.now(), fullName, email, password, role: role || 'STUDENT' };
    users.push(newUser);
    res.status(201).json({ message: 'Registration successful! Please log in.', userId: newUser.id });
});

// Auth: Login
app.post('/api/v1/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
    }
    res.status(200).json({ 
        message: 'Login successful', 
        token: 'mock-jwt-token-' + user.id, 
        user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } 
    });
});

// Tasks: Get all tasks for logged-in user
app.get('/api/v1/tasks', (req, res) => {
    const authHeader = req.headers.authorization;
    const userId = authHeader ? authHeader.replace('mock-jwt-token-', '') : 'user-1';
    const userTasks = tasks.filter(t => t.userId === userId || t.userId === 'user-1');
    res.status(200).json(userTasks);
});

// Tasks: Create task
app.post('/api/v1/tasks', (req, res) => {
    const { title, course, priority, dueDate, userId } = req.body;
    const newTask = {
        id: 'task-' + Date.now(),
        userId: userId || 'user-1',
        title: title || 'Untitled Task',
        course: course || 'MCA1005',
        priority: priority || 'MEDIUM',
        status: 'TODO',
        dueDate: dueDate || new Date().toISOString().split('T')[0]
    };
    tasks.push(newTask);
    res.status(201).json(newTask);
});

// Tasks: Update task status
app.patch('/api/v1/tasks/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const task = tasks.find(t => t.id === id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (status) task.status = status;
    res.status(200).json(task);
});

// Tasks: Delete task
app.delete('/api/v1/tasks/:id', (req, res) => {
    const { id } = req.params;
    tasks = tasks.filter(t => t.id !== id);
    res.status(200).json({ message: 'Task deleted successfully' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Student Task One Server running on port ${PORT}`);
});

module.exports = app;
