// user-events.js
// Handles User Events & Participation using APIClient

// -------------------- Load Available Events --------------------
async function loadAvailableEvents() {
    try {
        const res = await api.listEvents();
        if (!res.success) throw new Error(res.message);
        const events = res.data || [];

        const userRes = await api.getUser();
        if (!userRes.success) throw new Error(userRes.message);
        const currentUser = userRes.data;

        const progressRes = await api.getProgress();
        const allProgress = (progressRes.success && Array.isArray(progressRes.data)) ? progressRes.data : [];

        const eventsGrid = document.getElementById('eventsGrid');
        eventsGrid.innerHTML = '';

        if (events.length === 0) {
            eventsGrid.innerHTML = '<p>No events available at the moment</p>';
            return;
        }

        events.forEach(event => {
            const eventId = event.id || event.event_id;
            const userProgress = allProgress.find(p => p.event_id == eventId) || { status: 'not-joined', completed_tasks: [] };
            const hasJoined = userProgress.status !== 'not-joined';
            const participants = event.total_joined || 0;

            const card = document.createElement('div');
            card.className = 'event-card';
            card.innerHTML = `
                <div class="event-header">
                    <h3>${event.title}</h3>
                    <p>${event.description}</p>
                </div>
                <div class="event-body">
                    <div class="event-info">
                        <div class="event-info-item">
                            <span class="event-info-label">Levels</span>
                            <span class="event-info-value">${event.levels?.length || 0}</span>
                        </div>
                        <div class="event-info-item">
                            <span class="event-info-label">Participants</span>
                            <span class="event-info-value">${participants}</span>
                        </div>
                    </div>
                    <button class="btn btn-primary" onclick="joinEventConfirm('${eventId}')">
                        ${hasJoined ? 'Already Joined' : 'Join Event'}
                    </button>
                </div>
            `;
            eventsGrid.appendChild(card);
        });

    } catch (error) {
        console.error('Load available events error:', error);
        document.getElementById('eventsGrid').innerHTML = `<p>Error loading events: ${error.message}</p>`;
    }
}

// -------------------- Join Event Modal --------------------
async function joinEventConfirm(eventId) {
    try {
        const res = await api.getEvent(eventId);
        if (!res.success || !res.data) return;
        const event = res.data;

        const modal = document.getElementById('eventDetailsModal');
        const detailsBody = document.getElementById('eventDetailsBody');
        const eventTitle = document.getElementById('eventTitle');

        eventTitle.textContent = event.title;

        let detailsHTML = '';

        // First Level
        const firstLevel = event.levels?.[0];
        if (!firstLevel) {
            detailsHTML = '<p>No levels available for this event yet.</p>';
        } else {
            detailsHTML += `<p>${event.description || ''}</p>`;
            detailsHTML += `<h4>First Level: ${firstLevel.title}</h4>`;

            if (firstLevel.tasks?.length > 0) {
                detailsHTML += '<ul>';
                firstLevel.tasks.forEach(task => {
                    detailsHTML += `<li>${task.task_number}. ${task.question}</li>`;
                });
                detailsHTML += '</ul>';
            } else {
                detailsHTML += '<p>No tasks added to this level yet.</p>';
            }
        }

        detailsBody.innerHTML = detailsHTML;
        modal.classList.add('active');

        // Store for later
        window.currentEventToJoin = eventId;
        window.firstLevelTasks = firstLevel?.tasks || [];
        window.currentTaskIndex = 0;

    } catch (error) {
        console.error('Join event confirm error:', error);
    }
}

// -------------------- Join Event & Redirect --------------------
async function joinEvent() {
    const eventId = window.currentEventToJoin;
    if (!eventId) return;

    try {
        const res = await api.joinEvent(eventId);
        if (!res.success) throw new Error(res.message);

        alert('Event joined successfully!');
        closeModal();

        // Reload events
        await loadAvailableEvents();
        await loadMyEvents();

        // Redirect to Scan QR tab
        showSection('scan-qr');

        // Wait a tiny bit before initializing scanner to ensure DOM renders
        setTimeout(() => {
            if (typeof initializeScanner === 'function') {
                initializeScanner();
            } else {
                console.error('initializeScanner() not found!');
            }
        }, 100);

    } catch (error) {
        console.error('Join event error:', error);
        alert('Failed to join event: ' + error.message);
    }
}

// -------------------- Show First Task --------------------
function showFirstTask() {
    if (!window.firstLevelTasks || window.firstLevelTasks.length === 0) return;

    const task = window.firstLevelTasks[window.currentTaskIndex];

    const scanSection = document.getElementById('scan-qr');
    scanSection.innerHTML = `
        <h3>Task: ${task.title || task.question}</h3>
        <p>Scan the QR code for this task.</p>
        <div id="reader"></div>
        <div id="scanResult" class="scan-result"></div>
        <div class="qr-upload">
            <p>Or upload a QR code image:</p>
            <input type="file" id="qrImageInput" accept="image/*" onchange="handleImageUpload(event)">
        </div>
    `;

    showSection('scan-qr');

    if (typeof initializeScanner === 'function') {
        setTimeout(() => initializeScanner(), 100); // ensure #reader exists
    }
}

// -------------------- Load My Events --------------------
async function loadMyEvents() {
    try {
        const progressRes = await api.getProgress();
        if (!progressRes.success) throw new Error(progressRes.message);
        const progressList = progressRes.data || [];

        const eventsRes = await api.listEvents();
        if (!eventsRes.success) throw new Error(eventsRes.message);
        const events = eventsRes.data || [];

        const myEventsList = document.getElementById('myEventsList');
        myEventsList.innerHTML = '';

        if (progressList.length === 0) {
            myEventsList.innerHTML = '<p>You haven\'t joined any events yet. <a href="#" onclick="showSection(\'events\')">Browse events</a></p>';
            return;
        }

        progressList.forEach(ue => {
            const event = events.find(e => (e.id || e.event_id) == ue.event_id);
            if (!event) return;

            const totalTasks = event.levels?.reduce((sum, level) => sum + (level.tasks?.length || 0), 0) || 0;
            const completedTasks = ue.tasks_completed || 0;
            const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            const item = document.createElement('div');
            item.className = 'my-event-item';
            item.innerHTML = `
                <div class="event-info-section">
                    <h3>${event.title}</h3>
                    <p>${event.description}</p>
                    <button class="btn btn-primary" onclick="continueEvent('${ue.id || ue.event_id}')">
                        ${ue.progress_percentage === 100 ? 'View Results' : 'Continue'}
                    </button>
                </div>
                <div class="progress-section">
                    <div class="progress-stat">
                        <span class="progress-stat-label">Status:</span>
                        <span class="progress-stat-value">${ue.progress_percentage === 100 ? '✓ Completed' : '⏳ In Progress'}</span>
                    </div>
                    <div class="progress-stat">
                        <span class="progress-stat-label">Current Level:</span>
                        <span class="progress-stat-value">${ue.current_level}/${event.levels?.length || 0}</span>
                    </div>
                    <div class="progress-stat">
                        <span class="progress-stat-label">Completion:</span>
                        <span class="progress-stat-value">${completionPercent}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${completionPercent}%;"></div>
                    </div>
                </div>
            `;
            myEventsList.appendChild(item);
        });

    } catch (error) {
        console.error('Load my events error:', error);
    }
}

// -------------------- Continue Event --------------------
function continueEvent(userEventId) {
    window.currentUserEventId = userEventId;
    showSection('scan-qr');

    setTimeout(() => {
        if (typeof initializeScanner === 'function') initializeScanner();
    }, 100);
}

// -------------------- Modal --------------------
function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}

// -------------------- Init --------------------
document.addEventListener('DOMContentLoaded', () => {
    loadAvailableEvents();
    loadMyEvents();
});
