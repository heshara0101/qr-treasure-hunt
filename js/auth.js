// Authentication & Local Storage Management

const API_BASE = 'http://localhost/qr-treasure-hunt/api'; // Change to your backend API URL later

class StorageManager {
    static set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    static get(key) {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    }

    static remove(key) {
        localStorage.removeItem(key);
    }

    static clear() {
        localStorage.clear();
    }
}

class AuthManager {
    static getCurrentUser() {
        return StorageManager.get('currentUser');
    }

    static isLoggedIn() {
        return !!this.getCurrentUser();
    }

    static isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    }

    static login(user) {
        StorageManager.set('currentUser', user);
    }

    static logout() {
        StorageManager.remove('currentUser');
        window.location.href = 'index.html';
    }
}

// Navigation Functions
function goToLogin() {
    window.location.href = 'login.html';
}

function goToRegister() {
    window.location.href = 'register.html';
}

function logout() {
    AuthManager.logout();
}

// Auth Page Logic
let currentRole = 'user';

function selectRole(role) {
    currentRole = role;
    const buttons = document.querySelectorAll('.role-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

function handleRegister(event) {
    event.preventDefault();

    const fullname = document.getElementById('fullname').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agree = document.getElementById('agree').checked;

    if (!agree) {
        alert('Please agree to the terms and conditions');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    // Create user object
    const user = {
        id: Date.now().toString(),
        fullname,
        email,
        phone,
        password: btoa(password), // Simple encoding (use proper hashing in production)
        role: 'user',
        createdAt: new Date().toISOString(),
        events: []
    };

    // Get existing users
    let users = StorageManager.get('users') || [];
    
    // Check if email already exists
    if (users.find(u => u.email === email)) {
        alert('Email already registered');
        return;
    }

    users.push(user);
    StorageManager.set('users', users);

    alert('Registration successful! Please login.');
    window.location.href = 'login.html';
}

function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;

    // Get users
    let users = StorageManager.get('users') || [];
    let admins = StorageManager.get('admins') || getDefaultAdmins();

    let user = null;

    if (currentRole === 'user') {
        user = users.find(u => u.email === email && atob(u.password) === password);
    } else {
        user = admins.find(u => u.email === email && atob(u.password) === password);
    }

    if (!user) {
        alert('Invalid email or password');
        return;
    }

    // Remove password from stored user
    const userToStore = { ...user };
    delete userToStore.password;
    
    AuthManager.login(userToStore);
    StorageManager.set('rememberMe', remember);

    if (currentRole === 'admin') {
        window.location.href = 'admin/dashboard.html';
    } else {
        window.location.href = 'user/dashboard.html';
    }
}

// Default admin for demo
function getDefaultAdmins() {
    return [
        {
            id: '1',
            fullname: 'Admin',
            email: 'admin@example.com',
            password: btoa('admin123'),
            role: 'admin',
            createdAt: new Date().toISOString()
        }
    ];
}

// Initialize admin if not exists
if (!StorageManager.get('admins')) {
    StorageManager.set('admins', getDefaultAdmins());
}
