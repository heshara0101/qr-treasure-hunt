// Admin Results & Progress Tracking

function loadEventResults() {
    const events = StorageManager.get('events') || [];
    const userEvents = StorageManager.get('userEvents') || [];
    const users = StorageManager.get('users') || [];
    
    const selectedEventId = document.getElementById('resultEvent').value;
    const tbody = document.getElementById('resultsTableBody');
    tbody.innerHTML = '';

    // Filter results based on selected event
    let results = userEvents;
    if (selectedEventId) {
        results = results.filter(ue => ue.eventId === selectedEventId);
    }

    if (results.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No results yet</td></tr>';
        return;
    }

    results.forEach(result => {
        const user = users.find(u => u.id === result.userId);
        const event = events.find(e => e.id === result.eventId);

        if (!user || !event) return;

        const completionPercent = calculateCompletion(result, event);
        const statusBadge = getStatusBadge(result.status);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.fullname}</td>
            <td>${event.name}</td>
            <td>Level ${result.currentLevel}</td>
            <td>Task ${result.currentTask}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <div style="flex: 1; background: var(--border-color); height: 8px; border-radius: 4px; overflow: hidden;">
                        <div class="progress-fill" style="width: ${completionPercent}%; background: ${getProgressColor(result.status)};"></div>
                    </div>
                    <span>${completionPercent}%</span>
                </div>
            </td>
            <td>${statusBadge}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view-btn" onclick="viewUserResult('${result.id}')">View</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function calculateCompletion(userEvent, event) {
    if (!event.levels || event.levels.length === 0) return 0;

    const totalTasks = event.levels.reduce((sum, level) => sum + (level.tasks ? level.tasks.length : 0), 0);
    const completedLevel = userEvent.currentLevel - 1;
    const tasksInCurrentLevel = event.levels[completedLevel]?.tasks?.length || 0;

    let completedTasks = 0;
    for (let i = 0; i < completedLevel; i++) {
        completedTasks += event.levels[i]?.tasks?.length || 0;
    }
    completedTasks += Math.min(userEvent.currentTask - 1, tasksInCurrentLevel);

    return Math.round((completedTasks / totalTasks) * 100);
}

function getProgressColor(status) {
    switch(status) {
        case 'completed':
            return 'var(--success-color)';
        case 'in-progress':
            return 'var(--warning-color)';
        case 'wrong-qr':
            return 'var(--danger-color)';
        default:
            return 'var(--text-light)';
    }
}

function getStatusBadge(status) {
    const statusMap = {
        'completed': '<span class="status-badge status-completed">Completed</span>',
        'in-progress': '<span class="status-badge status-pending">In Progress</span>',
        'wrong-qr': '<span class="status-badge" style="background: #fee2e2; color: #991b1b;">Wrong QR</span>'
    };
    return statusMap[status] || '<span class="status-badge">Unknown</span>';
}

function viewUserResult(userEventId) {
    const userEvents = StorageManager.get('userEvents') || [];
    const events = StorageManager.get('events') || [];
    const users = StorageManager.get('users') || [];

    const userEvent = userEvents.find(ue => ue.id === userEventId);
    if (!userEvent) return;

    const user = users.find(u => u.id === userEvent.userId);
    const event = events.find(e => e.id === userEvent.eventId);

    const modal = document.getElementById('userResultModal');
    const resultBody = document.getElementById('userResultBody');

    const completionPercent = calculateCompletion(userEvent, event);

    let resultHTML = `
        <div class="results-detail">
            <div class="result-item">
                <span class="result-label">User:</span>
                <span class="result-value">${user.fullname}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Event:</span>
                <span class="result-value">${event.name}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Status:</span>
                <span class="result-value">${getStatusBadge(userEvent.status)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Current Level:</span>
                <span class="result-value">Level ${userEvent.currentLevel} - Task ${userEvent.currentTask}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Completion:</span>
                <span class="result-value">${completionPercent}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${completionPercent}%; background: ${getProgressColor(userEvent.status)};"></div>
            </div>
            <div class="result-item" style="margin-top: 1rem;">
                <span class="result-label">Started:</span>
                <span class="result-value">${new Date(userEvent.startedAt).toLocaleDateString()}</span>
            </div>
    `;

    if (userEvent.status === 'completed') {
        resultHTML += `
            <div class="result-item">
                <span class="result-label">Completed:</span>
                <span class="result-value">${new Date(userEvent.completedAt).toLocaleDateString()}</span>
            </div>
        `;
    }

    if (userEvent.wrongQRScans && userEvent.wrongQRScans.length > 0) {
        resultHTML += `
            <div class="result-item" style="margin-top: 1rem;">
                <span class="result-label">Wrong QR Scans:</span>
                <span class="result-value">${userEvent.wrongQRScans.length}</span>
            </div>
            <div style="margin-top: 0.5rem; padding: 0.5rem; background: #fee2e2; border-radius: 4px;">
                <strong style="color: #991b1b;">⚠️ Alert: User attempted to scan incorrect QR codes</strong>
                <ul style="margin-top: 0.5rem; margin-left: 1.5rem;">
        `;
        
        userEvent.wrongQRScans.forEach(scan => {
            resultHTML += `<li>Attempted Level ${scan.attemptedLevel} Task ${scan.attemptedTask} at Level ${userEvent.currentLevel}</li>`;
        });

        resultHTML += `
                </ul>
            </div>
        `;
    }

    resultHTML += '</div>';
    resultBody.innerHTML = resultHTML;
    modal.classList.add('active');
}

// Populate event dropdown
window.addEventListener('DOMContentLoaded', () => {
    const events = StorageManager.get('events') || [];
    const eventSelect = document.getElementById('resultEvent');

    events.forEach(event => {
        const option = document.createElement('option');
        option.value = event.id;
        option.textContent = event.name;
        eventSelect.appendChild(option);
    });

    loadEventResults();
});
