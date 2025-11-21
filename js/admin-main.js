// Admin Dashboard JS using APIClient

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
});

// Section Navigation
function showSection(sectionId) {
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

        // Stats
        document.getElementById('totalUsers').textContent = users.length;
        document.getElementById('totalEvents').textContent = events.length;

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

        document.getElementById('ongoingTrials').textContent = ongoingTrials;
        document.getElementById('completedTrials').textContent = completedTrials;

        // Load recent activity (last 10)
        loadRecentActivity(allResults);

    } catch (error) {
        console.error('Dashboard load error:', error);
    }
}

// Render Recent Activity
function loadRecentActivity(userEvents) {
    const activityList = document.getElementById('activityList');
    activityList.innerHTML = '';

    if (!userEvents || userEvents.length === 0) {
        activityList.innerHTML = '<p>No activity yet</p>';
        return;
    }

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

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
};
