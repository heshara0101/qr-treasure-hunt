// Admin Dashboard JS using APIClient

// Check if admin is logged in
window.addEventListener('DOMContentLoaded', async () => {
    const userResponse = await api.getUser();

    if (!userResponse.success || !userResponse.data || userResponse.data.role !== 'admin') {
        window.location.href = '../login.html';
        return;
    }

    // Set admin name
    const user = userResponse.data;
    document.getElementById('adminUser').textContent = user.name || 'Admin';

    // Initialize dashboard
    loadDashboard();
});

// Section Navigation
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));

    // Remove active from all menu items
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));

    // Show selected section
    document.getElementById(sectionId).classList.add('active');

    // Add active to clicked menu item
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
}

// Load Dashboard Data
async function loadDashboard() {
    try {
        // Fetch data from API
        const usersResponse = await api.getAllUsers();
        const eventsResponse = await api.listEvents();

        const users = usersResponse.success ? usersResponse.data : [];
        const events = eventsResponse.success ? eventsResponse.data : [];

        // Stats
        document.getElementById('totalUsers').textContent = users.length;
        document.getElementById('totalEvents').textContent = events.length;

        // Fetch recent activities for user-events
        let userEvents = [];
        for (let event of events) {
            const results = await api.getEventResults(event.id);
            if (results.success && results.data) {
                userEvents = userEvents.concat(results.data);
            }
        }

        const ongoingTrials = userEvents.filter(e => e.status === 'in-progress').length;
        const completedTrials = userEvents.filter(e => e.status === 'completed').length;

        document.getElementById('ongoingTrials').textContent = ongoingTrials;
        document.getElementById('completedTrials').textContent = completedTrials;

        loadRecentActivity(userEvents);
    } catch (error) {
        console.error('Dashboard load error:', error);
    }
}

// Load recent activity
function loadRecentActivity(userEvents) {
    const activityList = document.getElementById('activityList');
    activityList.innerHTML = '';

    if (!userEvents || userEvents.length === 0) {
        activityList.innerHTML = '<p>No activity yet</p>';
        return;
    }

    // Get last 10 activities
    const recentActivities = userEvents.slice(-10).reverse();

    recentActivities.forEach(activity => {
        const activityDiv = document.createElement('div');
        activityDiv.className = 'activity-item';
        activityDiv.innerHTML = `
            <div>
                <strong>${activity.user_name}</strong> started <strong>${activity.event_name}</strong>
            </div>
            <span class="activity-time">${new Date(activity.started_at).toLocaleDateString()}</span>
        `;
        activityList.appendChild(activityDiv);
    });
}

// Modal Functions
function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));
}

// Generic Modal Opener
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
};
