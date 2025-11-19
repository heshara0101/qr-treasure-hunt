// user-events.js
// Handles User Events & Participation using APIClient

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

        for (const event of events) {
            const eventId = event.id || event.event_id; // adjust if PHP returns 'event_id'
            const userProgress = allProgress.find(p => p.event_id == eventId) || { status: 'not-joined', completed_tasks: [] };
            const hasJoined = userProgress.status !== 'not-joined';
            const participants = event.total_joined || 0;

            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';
            eventCard.innerHTML = `
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
            eventsGrid.appendChild(eventCard);
        }

    } catch (error) {
        console.error('Load available events error:', error);
        document.getElementById('eventsGrid').innerHTML = `<p>Error loading events: ${error.message}</p>`;
    }
}

async function joinEventConfirm(eventId) {
    try {
        const res = await api.getEvent(eventId);
        if (!res.success || !res.data) return;
        const event = res.data;

        const modal = document.getElementById('eventDetailsModal');
        const detailsBody = document.getElementById('eventDetailsBody');
        const eventTitle = document.getElementById('eventTitle');

        eventTitle.textContent = event.title;

        let detailsHTML = `<p>${event.description}</p><h4>Event Structure:</h4>`;
        event.levels?.forEach(level => {
            detailsHTML += `<div style="margin-left:1rem;padding:0.75rem;background:#f0f0f0;border-radius:4px;margin-bottom:0.5rem;">
                <strong>Level ${level.level_number}:</strong> ${level.title} (${level.tasks?.length || 0} tasks)
            </div>`;
        });

        detailsBody.innerHTML = detailsHTML;
        modal.classList.add('active');
        window.currentEventToJoin = eventId;

    } catch (error) {
        console.error('Join event confirm error:', error);
    }
}

async function joinEvent() {
    const eventId = window.currentEventToJoin;
    if (!eventId) return;

    try {
        const res = await api.joinEvent(eventId);
        if (res.success) {
            alert('Event joined successfully!');
            closeModal();
            await loadAvailableEvents();
            await loadMyEvents();
        } else {
            alert(res.message || 'Failed to join event');
        }
    } catch (error) {
        console.error('Join event error:', error);
        alert('Failed to join event');
    }
}

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

            const eventItem = document.createElement('div');
            eventItem.className = 'my-event-item';
            eventItem.innerHTML = `
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
            myEventsList.appendChild(eventItem);
        });

    } catch (error) {
        console.error('Load my events error:', error);
    }
}

function continueEvent(userEventId) {
    window.currentUserEventId = userEventId;
    showSection('scan-qr');
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    loadAvailableEvents();
    loadMyEvents();
});
