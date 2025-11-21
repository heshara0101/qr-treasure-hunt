// Admin Users Management

async function loadUsers() {
    try {
        const usersRes = await api.getAllUsers();
        const users = usersRes.data || [];

        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';

        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center">No users registered yet</td></tr>';
            return;
        }

        for (let user of users) {
            const registeredDate = new Date(user.created_at).toLocaleDateString();
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.phone || '-'}</td>
                <td>${registeredDate}</td>
                <td><span class="status-badge status-active">Active</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view-btn" onclick="viewUserDetails('${user.id}')">View</button>
                        <button class="action-btn delete-btn" onclick="deleteUser('${user.id}')">Remove</button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        }

    } catch (error) {
        console.error(error);
        document.getElementById('usersTableBody').innerHTML = '<tr><td colspan="7" style="text-align:center">Failed to load users</td></tr>';
    }
}

async function viewUserDetails(userId) {
    try {
        const userRes = await api.getUserDetail(userId);
        const user = userRes.data;
        if (!user) return;

        const modal = document.getElementById('eventModal');
        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');

        modalTitle.textContent = 'User Details';

        let participationHTML = '';
        if (user.events && user.events.length > 0) {
            participationHTML += '<h4>Event Participation:</h4>';
            user.events.forEach(evt => {
                const status = evt.progress_percentage === 100 ? 'Completed' : 'In Progress';
                const progress = evt.progress_percentage ?? 0;

                participationHTML += `
                    <div style="margin-left:1rem; padding:0.5rem; background:#f5f5f5; border-radius:4px; margin-bottom:0.5rem;">
                        <strong>${evt.title}</strong> - ${status} (${progress}%)
                    </div>
                `;
            });
        } else {
            participationHTML = '<p>No events joined yet.</p>';
        }


        modalBody.innerHTML = `
            <div class="results-detail">
                <div class="result-item"><span class="result-label">Full Name:</span><span class="result-value">${user.name}</span></div>
                <div class="result-item"><span class="result-label">Email:</span><span class="result-value">${user.email}</span></div>
                <div class="result-item"><span class="result-label">Phone:</span><span class="result-value">${user.phone || '-'}</span></div>
                <div class="result-item"><span class="result-label">Registered:</span><span class="result-value">${new Date(user.created_at).toLocaleDateString()}</span></div>
                <div class="result-item"><span class="result-label">Events Joined:</span><span class="result-value">${user.events?.length || 0}</span></div>
                ${participationHTML}
            </div>
        `;

        modal.classList.add('active');
    } catch (error) {
        console.error(error);
        alert('Failed to load user details');
    }
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to remove this user?')) return;
    try {
        const res = await api.request(`admin.php?action=delete-user&user_id=${userId}`, 'DELETE');
        if (res.success) {
            alert('User removed successfully');
            await loadUsers();
        } else {
            alert(res.message || 'Failed to delete user');
        }
    } catch (error) {
        console.error(error);
        alert('Error deleting user');
    }
}

// Search functionality
document.getElementById('userSearch').addEventListener('keyup', function() {
    const searchTerm = this.value.toLowerCase();
    document.querySelectorAll('#usersTableBody tr').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(searchTerm) ? '' : 'none';
    });
});

// Initial load
loadUsers();
