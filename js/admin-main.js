// Admin Main Dashboard Functions

// Check if admin is logged in
window.addEventListener('DOMContentLoaded', () => {
    if (!AuthManager.isLoggedIn() || !AuthManager.isAdmin()) {
        window.location.href = '../login.html';
    }

    // Set admin name
    const user = AuthManager.getCurrentUser();
    document.getElementById('adminUser').textContent = user.fullname || 'Admin';

    // Initialize dashboard
    loadDashboard();
});

// Section Navigation
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Remove active from all menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });

    // Show selected section
    document.getElementById(sectionId).classList.add('active');

    // Add active to clicked menu item
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
}

// Load Dashboard Data
function loadDashboard() {
    const users = StorageManager.get('users') || [];
    const events = StorageManager.get('events') || [];
    const userEvents = StorageManager.get('userEvents') || [];

    // Update stats
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('totalEvents').textContent = events.length;

    const ongoingTrials = userEvents.filter(e => e.status === 'in-progress').length;
    const completedTrials = userEvents.filter(e => e.status === 'completed').length;

    document.getElementById('ongoingTrials').textContent = ongoingTrials;
    document.getElementById('completedTrials').textContent = completedTrials;

    // Load recent activity
    loadRecentActivity();
}

function loadRecentActivity() {
    const userEvents = StorageManager.get('userEvents') || [];
    const activityList = document.getElementById('activityList');
    activityList.innerHTML = '';

    // Get last 10 activities
    const recentActivities = userEvents.slice(-10).reverse();

    if (recentActivities.length === 0) {
        activityList.innerHTML = '<p>No activity yet</p>';
        return;
    }

    recentActivities.forEach(activity => {
        const activityDiv = document.createElement('div');
        activityDiv.className = 'activity-item';
        activityDiv.innerHTML = `
            <div>
                <strong>${activity.userName}</strong> started <strong>${activity.eventName}</strong>
            </div>
            <span class="activity-time">${new Date(activity.startedAt).toLocaleDateString()}</span>
        `;
        activityList.appendChild(activityDiv);
    });
}

// Modal Functions
function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// Generic Modal Opener
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}
