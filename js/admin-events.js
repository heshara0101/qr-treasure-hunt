// ================================
// Admin Event Management
// ================================
let currentEvent = null;
let levelCount = 0;
let taskCountPerLevel = {};
let selectedTaskTypes = {};

// --------------------
// Navigation
// --------------------
function goToCreateEvent() {
    showSection('create-event');
    initializeEventForm();
}

// --------------------
// Initialize Form
// --------------------
function initializeEventForm() {
    levelCount = 0;
    taskCountPerLevel = {};
    selectedTaskTypes = {};
    const levelsContainer = document.getElementById('levelsContainer');
    levelsContainer.innerHTML = '';
    addLevel();
}

// --------------------
// Levels
// --------------------
function addLevel() {
    levelCount++;
    const container = document.getElementById('levelsContainer');

    const levelDiv = document.createElement('div');
    levelDiv.className = 'level-item';
    levelDiv.id = `level-${levelCount}`;
    levelDiv.innerHTML = `
        <div class="level-header">
            <h4>Level ${levelCount}</h4>
            <button type="button" class="remove-level-btn" onclick="removeLevel(${levelCount})">Remove</button>
        </div>
        <div class="form-group">
            <label for="levelName-${levelCount}">Level Name</label>
            <input type="text" id="levelName-${levelCount}" placeholder="e.g., Finding the Entrance">
        </div>
        <div class="form-group">
            <label for="levelDescription-${levelCount}">Description</label>
            <textarea id="levelDescription-${levelCount}" rows="2"></textarea>
        </div>
        <div class="tasks-container" id="tasks-${levelCount}">
            <h4 style="margin-bottom: 0.75rem;">Tasks for Level ${levelCount}</h4>
        </div>
        <button type="button" class="btn btn-secondary" onclick="addTask(${levelCount})">+ Add Task</button>
    `;
    container.appendChild(levelDiv);

    addTask(levelCount); // Add first task automatically
}

function removeLevel(levelNumber) {
    const levelDiv = document.getElementById(`level-${levelNumber}`);
    if (levelDiv) levelDiv.remove();
}

// --------------------
// Tasks
// --------------------
function addTask(levelNumber) {
    if (!taskCountPerLevel[levelNumber]) taskCountPerLevel[levelNumber] = 0;
    taskCountPerLevel[levelNumber]++;
    const taskCount = taskCountPerLevel[levelNumber];

    const tasksContainer = document.getElementById(`tasks-${levelNumber}`);
    const taskDiv = document.createElement('div');
    taskDiv.className = 'task-item';
    taskDiv.id = `task-${levelNumber}-${taskCount}`;
    taskDiv.innerHTML = `
        <div style="flex: 1;">
            <div class="form-group">
                <label>Task ${taskCount} Type</label>
                <div class="task-type-selector">
                    <button type="button" class="task-type-btn active" onclick="selectTaskType(${levelNumber}, ${taskCount}, 'mcq', event)">MCQ</button>
                    <button type="button" class="task-type-btn" onclick="selectTaskType(${levelNumber}, ${taskCount}, 'image', event)">Image Upload</button>
                    <button type="button" class="task-type-btn" onclick="selectTaskType(${levelNumber}, ${taskCount}, 'text', event)">Text Input</button>
                </div>
            </div>
            <div class="form-group">
                <label for="taskQuestion-${levelNumber}-${taskCount}">Question/Description</label>
                <textarea id="taskQuestion-${levelNumber}-${taskCount}" rows="2" placeholder="Enter the task question or description"></textarea>
            </div>
            <div id="taskOptions-${levelNumber}-${taskCount}"></div>
            <div class="form-group">
                <label for="taskHint-${levelNumber}-${taskCount}">Hint (for next QR location)</label>
                <input type="text" id="taskHint-${levelNumber}-${taskCount}" placeholder="Hint to help users find next QR code">
            </div>
        </div>
        <button type="button" class="btn btn-danger" onclick="removeTask(${levelNumber}, ${taskCount})">Remove</button>
    `;
    tasksContainer.appendChild(taskDiv);
    selectTaskType(levelNumber, taskCount, 'mcq', { target: taskDiv.querySelector('.task-type-btn.active') });
}

function removeTask(levelNumber, taskCount) {
    const taskDiv = document.getElementById(`task-${levelNumber}-${taskCount}`);
    if (taskDiv) taskDiv.remove();
}

function selectTaskType(levelNumber, taskCount, type, event) {
    selectedTaskTypes[`${levelNumber}-${taskCount}`] = type;

    const buttons = document.querySelectorAll(`#task-${levelNumber}-${taskCount} .task-type-btn`);
    buttons.forEach(btn => btn.classList.remove('active'));
    if(event?.target) event.target.classList.add('active');

    renderTaskOptions(levelNumber, taskCount, type);
}

function renderTaskOptions(levelNumber, taskCount, type) {
    const optionsContainer = document.getElementById(`taskOptions-${levelNumber}-${taskCount}`);
    optionsContainer.innerHTML = '';

    if (type === 'mcq') {
        optionsContainer.innerHTML = `
            <div class="form-group">
                <label>MCQ Options</label>
                <div id="mcqOptions-${levelNumber}-${taskCount}">
                    ${[0,1,2,3].map(i => `
                        <div class="form-group">
                            <input type="radio" name="correct-${levelNumber}-${taskCount}" value="${i}" ${i===0?'checked':''}>
                            <input type="text" placeholder="Option ${i+1}" class="mcq-input" data-index="${i}">
                        </div>`).join('')}
                </div>
            </div>`;
    } else if (type === 'image') {
        optionsContainer.innerHTML = `
            <div class="form-group">
                <label for="imageAnswer-${levelNumber}-${taskCount}">Expected Image Format</label>
                <select id="imageAnswer-${levelNumber}-${taskCount}">
                    <option>User uploads image</option>
                    <option>Exact image matching</option>
                    <option>Image content verification</option>
                </select>
            </div>`;
    } else if (type === 'text') {
        optionsContainer.innerHTML = `
            <div class="form-group">
                <label for="textAnswer-${levelNumber}-${taskCount}">Correct Answer (Text)</label>
                <input type="text" id="textAnswer-${levelNumber}-${taskCount}" placeholder="Enter the correct answer">
            </div>
            <div class="form-group">
                <label><input type="checkbox" id="caseSensitive-${levelNumber}-${taskCount}"> Case Sensitive</label>
            </div>`;
    }

    // Add QR input field for manual entry
    optionsContainer.innerHTML += `
        <div class="form-group">
            <label for="taskQr-${levelNumber}-${taskCount}">QR Value *</label>
            <input type="text" id="taskQr-${levelNumber}-${taskCount}" placeholder="Enter QR value" required>
        </div>`;

}


// --------------------
// Submit Event
// --------------------
async function handleCreateEvent(e) {
    e.preventDefault();

    const eventName = document.getElementById('eventName').value.trim();
    const eventDescription = document.getElementById('eventDescription').value.trim();
    if (!eventName) return alert('Event name is required');

    try {
        const eventResp = await api.createEvent(eventName, eventDescription);
        const eventId = eventResp.data.id;

        for (let i = 1; i <= levelCount; i++) {
            const levelName = document.getElementById(`levelName-${i}`).value || `Level ${i}`;
            const levelDescription = document.getElementById(`levelDescription-${i}`).value;

            const levelResp = await api.addLevel(eventId, i, levelName, levelDescription);

            const taskDivs = document.querySelectorAll(`#tasks-${i} .task-item`);
            for (let j = 0; j < taskDivs.length; j++) {
                const taskNumber = j + 1;
                const taskType = selectedTaskTypes[`${i}-${taskNumber}`] || 'mcq';
                const question = document.getElementById(`taskQuestion-${i}-${taskNumber}`).value;
                const hint = document.getElementById(`taskHint-${i}-${taskNumber}`).value;

                let options = [];
                let correctAnswer = null;

                // Use only manual QR, required
                const manualQrInput = document.getElementById(`taskQr-${i}-${taskNumber}`).value.trim();
                if (!manualQrInput) {
                    alert(`QR value is required for Level ${i} Task ${taskNumber}`);
                    return;
                }
                const qrValue = manualQrInput;

                if (taskType === 'mcq') {
                    options = Array.from(taskDivs[j].querySelectorAll('.mcq-input')).map(input => input.value);
                    correctAnswer = parseInt(taskDivs[j].querySelector(`input[name="correct-${i}-${taskNumber}"]:checked`).value);
                } else if (taskType === 'text') {
                    correctAnswer = document.getElementById(`textAnswer-${i}-${taskNumber}`).value;
                }

                await api.addTask(levelResp.data.id, taskNumber, taskType, question, options, correctAnswer, qrValue, hint);

            }
        }

        alert('Event created successfully!');
        document.getElementById('eventForm').reset();
        initializeEventForm();
        showSection('events');
        await loadEvents();

    } catch (err) {
        console.error(err);
        alert('Failed to create event. Check console for details.');
    }
}


// --------------------
// Load Events
// --------------------
async function loadEvents() {
    const tbody = document.getElementById('eventsTableBody');
    tbody.innerHTML = '';

    try {
        const eventsResp = await api.listEvents();
        const events = eventsResp.data || [];

        if (events.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No events yet</td></tr>';
            return;
        }

        for (const e of events) {
            // Fetch full event details for levels
            const eventDetailResp = await api.getEvent(e.id);
            const levelsCount = eventDetailResp?.data?.levels?.length || 0;
            const participantsCount = e.total_joined || 0;
            const createdDate = new Date(e.created_at).toLocaleDateString();

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${e.title}</strong></td>
                <td>${levelsCount}</td>
                <td>${createdDate}</td>
                <td><span class="status-badge status-${e.status || 'active'}">${e.status || 'active'}</span></td>
                <td>${participantsCount}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view-btn" onclick="viewEventDetails('${e.id}')">View</button>
                        <button class="action-btn edit-btn" onclick="updateEvent('${e.id}')">Edit</button>
                        <button class="action-btn delete-btn" onclick="deleteEvent('${e.id}')">Delete</button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        }

    } catch (err) {
        console.error('Failed to load events:', err);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Error loading events</td></tr>';
    }
}


// --------------------
// View Event Details
// --------------------
async function viewEventDetails(eventId){
    try{
        const eventResp = await api.getEvent(eventId);
        const event = eventResp.data;
        if(!event) return;

        const modal = document.getElementById('eventModal');
        const modalBody = document.getElementById('modalBody');

        let detailsHTML = `<div class="results-detail">
            <div class="result-item"><span class="result-label">Event Name:</span><span class="result-value">${event.title}</span></div>
            <div class="result-item"><span class="result-label">Description:</span><span class="result-value">${event.description}</span></div>
            <div class="result-item"><span class="result-label">Levels:</span><span class="result-value">${event.levels?.length || 0}</span></div>
            <div class="result-item"><span class="result-label">Participants:</span><span class="result-value">${event.total_joined || 0}</span></div>
            <div class="result-item"><span class="result-label">Status:</span><span class="result-value">${event.status || 'active'}</span></div>
            <div class="result-item"><span class="result-label">Created:</span><span class="result-value">${new Date(event.created_at || event.createdAt).toLocaleDateString()}</span></div>
        `;

        detailsHTML += '<h4 style="margin-top:1rem;">Levels:</h4>';
        (event.levels || []).forEach(level => {
            detailsHTML += `
                <div style="margin-left:1rem; padding:0.5rem; background:var(--light-bg); border-radius:4px; margin-bottom:0.5rem;">
                    <strong>Level ${level.level_number}: ${level.title}</strong> (${level.tasks?.length || 0} tasks)
                </div>
            `;
        });

        detailsHTML += '</div>';
        modalBody.innerHTML = detailsHTML;
        modal.classList.add('active');

    } catch(err){
        console.error('View event error:', err);
        alert('Failed to load event details');
    }
}

// --------------------
// Update/Delete
// --------------------
function updateEvent(eventId){
    alert('Edit functionality coming soon');
}

async function deleteEvent(eventId){
    if(!confirm('Are you sure you want to delete this event?')) return;

    try{
        await api.deleteEvent(eventId);
        await loadEvents();
        alert('Event deleted successfully!');
    } catch(err){
        console.error(err);
        alert('Failed to delete event');
    }
}
