<<<<<<< HEAD
// Admin Results Page with Debugging
console.log("DEBUG: admin-results.js loaded");

async function loadEventResults() {
    console.log("DEBUG: Loading event results...");

    try {
        // 1️⃣ Get current user
        const userRes = await api.getUser();
        const user = userRes.data;
        console.log("DEBUG: Current user:", user);

        if (user.role !== "admin") {
            alert("Unauthorized");
            return;
        }

        // 2️⃣ Fetch all events
        const eventsRes = await api.listEvents();
        console.log("DEBUG: Events Response:", eventsRes);

        if (!eventsRes.success || !eventsRes.data || eventsRes.data.length === 0) {
            console.warn("DEBUG: No events found");
            renderResultsTable([]); // clear table if no events
            return;
        }

        // 3️⃣ Render dropdown & auto-load first event
        renderEventsDropdown(eventsRes.data);

    } catch (error) {
        console.error("ERROR loading event results:", error);
    }
}

function renderEventsDropdown(events) {
    console.log("DEBUG: Rendering dropdown with events:", events);

    const select = document.getElementById("resultEvent");
    if (!select) {
        console.error("ERROR: resultEvent select not found!");
        return;
    }

    select.innerHTML = `<option value="">-- Select Event --</option>`;

    events.forEach(evt => {
        select.innerHTML += `<option value="${evt.id}">${evt.title}</option>`;
    });

    // Automatically load first event with results
    const firstEventId = events[0]?.id;
    if (firstEventId) {
        select.value = firstEventId;
        console.log("DEBUG: Loading first event by default:", firstEventId);
        loadResultsForEvent(firstEventId);
    }

    // Event listener for dropdown change
    select.onchange = () => {
        const eventId = select.value;
        console.log("DEBUG: Selected event ID:", eventId);
        if (eventId) {
            loadResultsForEvent(eventId);
        } else {
            renderResultsTable([]); // clear table if no event selected
        }
    };
}

async function loadResultsForEvent(eventId) {
    console.log("DEBUG: Loading results for event:", eventId);

    if (!eventId) {
        console.warn("DEBUG: No event ID provided, skipping loadResultsForEvent");
        renderResultsTable([]);
        return;
    }

    try {
        const resultsRes = await api.getEventResults(eventId);
        console.log("DEBUG: Event results response:", resultsRes);

        const results = resultsRes.data || [];
        console.log("DEBUG: resultsRes.data =", results);

        renderResultsTable(results);

    } catch (error) {
        console.error("ERROR loading event results:", error);
        renderResultsTable([]);
    }
}

function renderResultsTable(results) {
    console.log("DEBUG: Rendering results table:", results);

    const tbody = document.getElementById("resultsTableBody");
    if (!tbody) {
        console.error("ERROR: resultsTableBody not found!");
        return;
    }

    tbody.innerHTML = "";

    if (!results || results.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No users found.</td></tr>`;
        return;
    }

    results.forEach(r => {
        const completedTasks = r.tasks_completed ?? 0;
        const totalTasks = r.total_tasks ?? 0;
        const progress = r.progress_percentage ?? 0;

        console.log("DEBUG: Rendering row for:", r);

        tbody.innerHTML += `
            <tr>
                <td>${r.name}</td>
                <td>${r.email}</td>
                <td>${completedTasks}</td>
                <td>${totalTasks}</td>
                <td>${progress}%</td>
            </tr>
        `;
    });
}

// Initial call to load events & results
document.addEventListener("DOMContentLoaded", () => {
    loadEventResults();
});
=======
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
>>>>>>> 9d2d3fd10107955f01d64ad124785ad9889d0143
