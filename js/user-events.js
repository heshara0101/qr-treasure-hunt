// User Events & Participation

function loadAvailableEvents() {
    const events = StorageManager.get('events') || [];
    const userEvents = StorageManager.get('userEvents') || [];
    const currentUser = AuthManager.getCurrentUser();

    const eventsGrid = document.getElementById('eventsGrid');
    eventsGrid.innerHTML = '';

    if (events.length === 0) {
        eventsGrid.innerHTML = '<p>No events available at the moment</p>';
        return;
    }

    events.forEach(event => {
        const hasJoined = userEvents.some(ue => ue.userId === currentUser.id && ue.eventId === event.id);
        const participants = userEvents.filter(ue => ue.eventId === event.id).length;

        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        eventCard.innerHTML = `
            <div class="event-header">
                <h3>${event.name}</h3>
                <p>${event.description}</p>
            </div>
            <div class="event-body">
                <div class="event-info">
                    <div class="event-info-item">
                        <span class="event-info-label">Levels</span>
                        <span class="event-info-value">${event.levels.length}</span>
                    </div>
                    <div class="event-info-item">
                        <span class="event-info-label">Participants</span>
                        <span class="event-info-value">${participants}</span>
                    </div>
                </div>
                <p class="event-description">${event.description}</p>
                <button class="btn btn-primary" onclick="joinEventConfirm('${event.id}')">
                    ${hasJoined ? 'Already Joined' : 'Join Event'}
                </button>
            </div>
        `;
        eventsGrid.appendChild(eventCard);
    });
}

function joinEventConfirm(eventId) {
    const events = StorageManager.get('events') || [];
    const event = events.find(e => e.id === eventId);

    if (!event) return;

    const modal = document.getElementById('eventDetailsModal');
    const detailsBody = document.getElementById('eventDetailsBody');
    const eventTitle = document.getElementById('eventTitle');

    eventTitle.textContent = event.name;

    let detailsHTML = `
        <div style="margin-bottom: 1.5rem;">
            <p>${event.description}</p>
            <h4 style="margin-top: 1rem; margin-bottom: 0.5rem; color: var(--primary-color);">Event Structure:</h4>
    `;

    event.levels.forEach(level => {
        detailsHTML += `
            <div style="margin-left: 1rem; padding: 0.75rem; background: var(--light-bg); border-radius: 4px; margin-bottom: 0.5rem;">
                <strong>Level ${level.levelNumber}:</strong> ${level.name} (${level.tasks.length} tasks)
            </div>
        `;
    });

    detailsHTML += '</div>';
    detailsBody.innerHTML = detailsHTML;

    modal.classList.add('active');
    window.currentEventToJoin = eventId;
}

function joinEvent() {
    const eventId = window.currentEventToJoin;
    const events = StorageManager.get('events') || [];
    const event = events.find(e => e.id === eventId);
    const currentUser = AuthManager.getCurrentUser();

    if (!event) {
        alert('Event not found');
        return;
    }

    // Check if already joined
    const userEvents = StorageManager.get('userEvents') || [];
    if (userEvents.some(ue => ue.userId === currentUser.id && ue.eventId === event.id)) {
        alert('You have already joined this event');
        return;
    }

    // Create user event participation
    const userEvent = {
        id: Date.now().toString(),
        userId: currentUser.id,
        userName: currentUser.fullname,
        eventId: eventId,
        eventName: event.name,
        status: 'in-progress',
        currentLevel: 1,
        currentTask: 1,
        startedAt: new Date().toISOString(),
        completedAt: null,
        wrongQRScans: [],
        completedTasks: []
    };

    userEvents.push(userEvent);
    StorageManager.set('userEvents', userEvents);

    // Update event participant count
    event.participants = (event.participants || 0) + 1;
    StorageManager.set('events', events);

    alert('Event joined successfully! Start scanning QR codes.');
    closeModal();
    loadAvailableEvents();
    loadMyEvents();
}

function loadMyEvents() {
    const userEvents = StorageManager.get('userEvents') || [];
    const events = StorageManager.get('events') || [];
    const currentUser = AuthManager.getCurrentUser();

    const myEventsList = document.getElementById('myEventsList');
    myEventsList.innerHTML = '';

    const userJoinedEvents = userEvents.filter(ue => ue.userId === currentUser.id);

    if (userJoinedEvents.length === 0) {
        myEventsList.innerHTML = '<p>You haven\'t joined any events yet. <a href="#" onclick="showSection(\'events\')">Browse events</a></p>';
        return;
    }

    userJoinedEvents.forEach(ue => {
        const event = events.find(e => e.id === ue.eventId);
        if (!event) return;

        const totalTasks = event.levels.reduce((sum, level) => sum + (level.tasks ? level.tasks.length : 0), 0);
        const completedTasks = ue.completedTasks.length;
        const completionPercent = Math.round((completedTasks / totalTasks) * 100);

        const eventItem = document.createElement('div');
        eventItem.className = 'my-event-item';
        eventItem.innerHTML = `
            <div class="event-info-section">
                <h3>${event.name}</h3>
                <p>${event.description}</p>
                <button class="btn btn-primary" onclick="continueEvent('${ue.id}')">
                    ${ue.status === 'completed' ? 'View Results' : 'Continue'}
                </button>
            </div>
            <div class="progress-section">
                <div class="progress-stat">
                    <span class="progress-stat-label">Status:</span>
                    <span class="progress-stat-value">${ue.status === 'completed' ? '✓ Completed' : '⏳ In Progress'}</span>
                </div>
                <div class="progress-stat">
                    <span class="progress-stat-label">Current Level:</span>
                    <span class="progress-stat-value">${ue.currentLevel}/${event.levels.length}</span>
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
}

function continueEvent(userEventId) {
    window.currentUserEventId = userEventId;
    showSection('scan-qr');
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}
