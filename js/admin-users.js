// Admin Users Management

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('userSearch').addEventListener('keyup', searchUsers);
});

function loadUsers() {
    const users = StorageManager.get('users') || [];
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';

    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No users registered yet</td></tr>';
        return;
    }

    users.forEach(user => {
        const registeredDate = new Date(user.createdAt).toLocaleDateString();
        const userEvents = StorageManager.get('userEvents') || [];
        const joinedEvents = userEvents.filter(ue => ue.userId === user.id);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.fullname}</td>
            <td>${user.email}</td>
            <td>${user.phone || '-'}</td>
            <td>${registeredDate}</td>
            <td>${joinedEvents.length}</td>
            <td><span class="status-badge status-active">Active</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view-btn" onclick="viewUserDetails('${user.id}')">View</button>
                    <button class="action-btn delete-btn" onclick="deleteUser('${user.id}')">Remove</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function searchUsers() {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    const rows = document.querySelectorAll('tbody tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function viewUserDetails(userId) {
    const users = StorageManager.get('users') || [];
    const user = users.find(u => u.id === userId);

    if (!user) return;

    const modal = document.getElementById('eventModal');
    const modalBody = document.getElementById('modalBody');
    const modalTitle = document.getElementById('modalTitle');

    modalTitle.textContent = 'User Details';

    const userEvents = StorageManager.get('userEvents') || [];
    const userParticipation = userEvents.filter(ue => ue.userId === userId);

    let detailsHTML = `
        <div class="results-detail">
            <div class="result-item">
                <span class="result-label">Full Name:</span>
                <span class="result-value">${user.fullname}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Email:</span>
                <span class="result-value">${user.email}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Phone:</span>
                <span class="result-value">${user.phone || '-'}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Registered:</span>
                <span class="result-value">${new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Events Joined:</span>
                <span class="result-value">${userParticipation.length}</span>
            </div>
    `;

    if (userParticipation.length > 0) {
        detailsHTML += '<h4 style="margin-top: 1rem; margin-bottom: 0.5rem;">Event Participation:</h4>';
        userParticipation.forEach(up => {
            const status = up.status === 'completed' ? 'Completed' : 'In Progress';
            detailsHTML += `
                <div style="margin-left: 1rem; padding: 0.5rem; background: var(--light-bg); border-radius: 4px; margin-bottom: 0.5rem;">
                    <strong>${up.eventName}</strong> - ${status}
                </div>
            `;
        });
    }

    detailsHTML += '</div>';
    modalBody.innerHTML = detailsHTML;
    modal.classList.add('active');
}

function deleteUser(userId) {
    if (!confirm('Are you sure you want to remove this user?')) return;

    let users = StorageManager.get('users') || [];
    users = users.filter(u => u.id !== userId);
    StorageManager.set('users', users);

    loadUsers();
}

// Load users when section is shown
const originalShowSection = window.showSection;
window.showSection = function(sectionId) {
    originalShowSection(sectionId);
    if (sectionId === 'users') {
        loadUsers();
    } else if (sectionId === 'events') {
        loadEvents();
    }
}

// Initial load
loadUsers();
