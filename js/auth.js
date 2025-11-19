// ----------------------------
// GLOBAL API CLIENT (PHP)
// ----------------------------
const API = api; // from php-api.js

// ----------------------------
// ROLE SELECTION
let currentRole = 'user';

function selectRole(role, btn) {
    currentRole = role;
    document.querySelectorAll('.role-btn')
        .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

// ----------------------------
// REGISTER
async function handleRegister(event) {
    event.preventDefault();

    let fullname = document.getElementById('fullname').value;
    let email = document.getElementById('email').value;
    let phone = document.getElementById('phone').value;
    let password = document.getElementById('password').value;
    let confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) return alert("Passwords do not match");

    const result = await API.register(email, password, fullname, phone);

    if (!result.success) return alert(result.message);

    alert("Registration successful! Please login.");
    window.location.href = "login.html";
}

// ----------------------------
// LOGIN
async function handleLogin(event) {
    event.preventDefault();

    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;

    const result = await API.login(email, password);

    if (!result.success) {
        return alert(result.message || "Login failed");
    }

    // Save user data (no .user, just result.data)
    const user = result.data;
    localStorage.setItem("currentUser", JSON.stringify(user));
    localStorage.setItem("token", user.token); // also save token if needed

    if (user.role === "admin") {
        window.location.href = "admin/dashboard.html";
    } else {
        window.location.href = "user/dashboard.html";
    }
}


// ----------------------------
// LOAD PROFILE
async function loadUserProfile() {
    const result = await API.getUser();

    if (!result.success) return alert(result.message);

    const user = result.data.user;

    document.getElementById("profileName").value = user.name;
    document.getElementById("profileEmail").value = user.email;
    document.getElementById("profilePhone").value = user.phone;
}

function logout() {
    try {
        // Get token from localStorage
        const token = localStorage.getItem('token');

        // Optional: call backend logout if endpoint exists
        if (token) {
            fetch(`${API_BASE_URL}/auth.php?action=logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }).catch(err => console.warn('Backend logout failed:', err));
        }
    } finally {
        // Clear local storage safely
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');

        // Redirect to index.html (adjust the path if needed)
        window.location.href = '/qr-treasure-hunt/index.html';
    }
}

function goToLogin() {
    window.location.href = "login.html"; // correct path for PHP version
}

function goToRegister() {
    window.location.href = "register.html"; // correct path for PHP version
}
