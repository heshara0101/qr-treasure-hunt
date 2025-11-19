// Admin Dashboard JS using APIClient

<<<<<<< HEAD
window.addEventListener('DOMContentLoaded', async () => {
    try {
        // 1️⃣ Get current admin user
        const userRes = await api.getUser();
        if (!userRes.success || !userRes.data || userRes.data.role !== 'admin') {
            window.location.href = '../login.html';
            return;
        }

        const user = userRes.data;
        document.getElementById('adminUser').textContent = user.name || 'Admin';

        // 2️⃣ Load dashboard, events, users, and results
        await loadDashboard();
        await loadEvents();
        await loadUsers();
        await loadEventResults();
    } catch (error) {
        console.error("Error initializing dashboard:", error);
    }
=======
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
>>>>>>> 9d2d3fd10107955f01d64ad124785ad9889d0143
});

// Section Navigation
function showSection(sectionId) {
<<<<<<< HEAD
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));

    document.getElementById(sectionId).classList.add('active');
    const menuItem = document.querySelector(`[data-section="${sectionId}"]`);
    if (menuItem) menuItem.classList.add('active');
}

// Load Dashboard Data & Recent Activity
async function loadDashboard() {
    try {
        // Fetch users and events
        const usersRes = await api.getAllUsers();
        const eventsRes = await api.listEvents();

        const users = usersRes.success ? usersRes.data : [];
        const events = eventsRes.success ? eventsRes.data : [];
=======
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
>>>>>>> 9d2d3fd10107955f01d64ad124785ad9889d0143

        // Stats
        document.getElementById('totalUsers').textContent = users.length;
        document.getElementById('totalEvents').textContent = events.length;

<<<<<<< HEAD
        // Collect user events for recent activity
        let allResults = [];
        for (let event of events) {
            const res = await api.getEventResults(event.id);
            if (res.success && Array.isArray(res.data)) {
                // Map results to standard activity format
                const mapped = res.data.map(r => ({
                    user_name: r.name,
                    event_name: event.title,
                    started_at: r.started_at || r.created_at || new Date(),
                    status: r.status || (r.progress_percentage === 100 ? 'completed' : 'in-progress')
                }));
                allResults = allResults.concat(mapped);
            }
        }

        // Count ongoing & completed trials
        const ongoingTrials = allResults.filter(a => a.status === 'in-progress').length;
        const completedTrials = allResults.filter(a => a.status === 'completed').length;
=======
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
>>>>>>> 9d2d3fd10107955f01d64ad124785ad9889d0143

        document.getElementById('ongoingTrials').textContent = ongoingTrials;
        document.getElementById('completedTrials').textContent = completedTrials;

<<<<<<< HEAD
        // Load recent activity (last 10)
        loadRecentActivity(allResults);

=======
        loadRecentActivity(userEvents);
>>>>>>> 9d2d3fd10107955f01d64ad124785ad9889d0143
    } catch (error) {
        console.error('Dashboard load error:', error);
    }
}

<<<<<<< HEAD
// Render Recent Activity
=======
// Load recent activity
>>>>>>> 9d2d3fd10107955f01d64ad124785ad9889d0143
function loadRecentActivity(userEvents) {
    const activityList = document.getElementById('activityList');
    activityList.innerHTML = '';

    if (!userEvents || userEvents.length === 0) {
        activityList.innerHTML = '<p>No activity yet</p>';
        return;
    }

<<<<<<< HEAD
    // Sort by started_at descending & take last 10
    const recentActivities = userEvents
        .sort((a, b) => new Date(b.started_at) - new Date(a.started_at))
        .slice(0, 10);

    recentActivities.forEach(activity => {
        const div = document.createElement('div');
        div.className = 'activity-item';
        div.innerHTML = `
            <div>
                <strong>${activity.user_name}</strong> participated in <strong>${activity.event_name}</strong>
            </div>
            <span class="activity-time">${new Date(activity.started_at).toLocaleString()}</span>
        `;
        activityList.appendChild(div);
    });
}

// Modal Close
function closeModal() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
}

=======
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
>>>>>>> 9d2d3fd10107955f01d64ad124785ad9889d0143
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
};
