// Admin Results & Progress Tracking

async function loadEventResults() {
    try {
        const eventsRes = await api.listEvents();
        const events = eventsRes.data || [];

        const eventSelect = document.getElementById('resultEvent');
        eventSelect.innerHTML = '<option value="">Select Event</option>';
        events.forEach(evt => {
            const option = document.createElement('option');
            option.value = evt.id;
            option.textContent = evt.title;
            eventSelect.appendChild(option);
        });

        const selectedEventId = eventSelect.value;
        const tbody = document.getElementById('resultsTableBody');
        tbody.innerHTML = '';

        if (!selectedEventId) return;

        const resultsRes = await api.getEventResults(selectedEventId);
        const results = resultsRes.data || [];

        if (results.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center">No results yet</td></tr>';
            return;
        }

        results.forEach(res => {
            const row = document.createElement('tr');
            const completionPercent = Math.round((res.completedTasks / res.totalTasks) * 100);

            row.innerHTML = `
                <td>${res.user_fullname}</td>
                <td>${res.event_title}</td>
                <td>Level ${res.currentLevel}</td>
                <td>Task ${res.currentTask}</td>
                <td>
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                        <div style="flex:1; background:var(--border-color); height:8px; border-radius:4px; overflow:hidden;">
                            <div class="progress-fill" style="width:${completionPercent}%; background:${getProgressColor(res.status)};"></div>
                        </div>
                        <span>${completionPercent}%</span>
                    </div>
                </td>
                <td>${getStatusBadge(res.status)}</td>
                <td>
                    <button class="action-btn view-btn" onclick="viewUserResult('${res.user_event_id}')">View</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error(error);
        document.getElementById('resultsTableBody').innerHTML = '<tr><td colspan="7" style="text-align:center">Failed to load results</td></tr>';
    }
}

function getProgressColor(status) {
    switch(status) {
        case 'completed': return 'var(--success-color)';
        case 'in-progress': return 'var(--warning-color)';
        case 'wrong-qr': return 'var(--danger-color)';
        default: return 'var(--text-light)';
    }
}

function getStatusBadge(status) {
    const map = {
        'completed': '<span class="status-badge status-completed">Completed</span>',
        'in-progress': '<span class="status-badge status-pending">In Progress</span>',
        'wrong-qr': '<span class="status-badge" style="background:#fee2e2;color:#991b1b;">Wrong QR</span>'
    };
    return map[status] || '<span class="status-badge">Unknown</span>';
}

async function viewUserResult(userEventId) {
    try {
        const res = await api.request(`admin.php?action=get-user-event-detail&user_event_id=${userEventId}`);
        const data = res.data;
        if (!data) return;

        const modal = document.getElementById('userResultModal');
        const modalBody = document.getElementById('userResultBody');

        const completionPercent = Math.round((data.completedTasks / data.totalTasks) * 100);

        let html = `
            <div class="results-detail">
                <div class="result-item"><span class="result-label">User:</span><span class="result-value">${data.user_fullname}</span></div>
                <div class="result-item"><span class="result-label">Event:</span><span class="result-value">${data.event_title}</span></div>
                <div class="result-item"><span class="result-label">Status:</span><span class="result-value">${getStatusBadge(data.status)}</span></div>
                <div class="result-item"><span class="result-label">Current Level:</span><span class="result-value">Level ${data.currentLevel} - Task ${data.currentTask}</span></div>
                <div class="result-item"><span class="result-label">Completion:</span><span class="result-value">${completionPercent}%</span></div>
                <div class="progress-bar"><div class="progress-fill" style="width:${completionPercent}%; background:${getProgressColor(data.status)};"></div></div>
            </div>
        `;

        modalBody.innerHTML = html;
        modal.classList.add('active');
    } catch (error) {
        console.error(error);
        alert('Failed to load user result');
    }
}

// Trigger load on event select change
document.getElementById('resultEvent').addEventListener('change', loadEventResults);

// Initial load
loadEventResults();
