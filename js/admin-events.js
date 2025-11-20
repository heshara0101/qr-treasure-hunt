// ================================
// Admin Event Management - Fixed & Improved 
// - Robust DOM lookups with helpful errors
// - Uses actual DOM IDs (no fragile index math)
// - Handles deletions without renumbering
// - Better validation and API error handling
// - Cleaner structure and comments

// State
let currentEvent = null;
let levelCount = 0;
let taskCountPerLevel = {};
let selectedTaskTypes = {};

// --------------------
// Small helpers
// --------------------
function safeGet(id, { required = true, trim = true } = {}) {
    const el = document.getElementById(id);
    if (!el) {
        const msg = `Missing element: ${id}`;
        console.error(msg);
        if (required) throw new Error(msg);
        return '';
    }
    const val = el.value === undefined ? '' : el.value;
    return trim && typeof val === 'string' ? val.trim() : val;
}

function queryOne(selector, context = document, required = true) {
    const el = context.querySelector(selector);
    if (!el && required) {
        console.error(`Missing element selector: ${selector}`);
        throw new Error(`Missing element: ${selector}`);
    }
    return el;
}

function parseIdNumber(str, prefix) {
    // Example: parseIdNumber('task-2-5', 'task-2-') => '5'
    if (!str || !prefix) return null;
    if (!str.startsWith(prefix)) return null;
    return str.slice(prefix.length);
}

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
    if (!levelsContainer) {
        console.error('No #levelsContainer found in DOM');
        return;
    }
    levelsContainer.innerHTML = '';
    addLevel();
}

// --------------------
// Levels
// --------------------
function addLevel() {
    levelCount++;
    const container = document.getElementById('levelsContainer');
    if (!container) return console.error('Missing #levelsContainer');

    const levelNumber = levelCount; // stable unique number for IDs
    taskCountPerLevel[levelNumber] = 0;

    const levelDiv = document.createElement('div');
    levelDiv.className = 'level-item';
    levelDiv.id = `level-${levelNumber}`;

    levelDiv.innerHTML = `
        <div class="level-header">
            <h4>Level ${levelNumber}</h4>
            <button type="button" class="remove-level-btn" onclick="removeLevel(${levelNumber})">Remove</button>
        </div>
        <div class="form-group">
            <label for="levelName-${levelNumber}">Level Name</label>
            <input type="text" id="levelName-${levelNumber}" placeholder="e.g., Finding the Entrance">
        </div>
        <div class="form-group">
            <label for="levelDescription-${levelNumber}">Description</label>
            <textarea id="levelDescription-${levelNumber}" rows="2"></textarea>
        </div>
        <div class="tasks-container" id="tasks-${levelNumber}">
            <h4 style="margin-bottom: 0.75rem;">Tasks for Level ${levelNumber}</h4>
        </div>
        <button type="button" class="btn btn-secondary" onclick="addTask(${levelNumber})">+ Add Task</button>
    `;

    container.appendChild(levelDiv);

    // Add first task automatically
    addTask(levelNumber);
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
    if (!tasksContainer) return console.error(`Missing tasks container for level ${levelNumber}`);

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
    if (event?.target) event.target.classList.add('active');

    renderTaskOptions(levelNumber, taskCount, type);
}

function renderTaskOptions(levelNumber, taskCount, type) {
    const optionsContainer = document.getElementById(`taskOptions-${levelNumber}-${taskCount}`);
    if (!optionsContainer) return console.error(`Missing options container for task ${levelNumber}-${taskCount}`);
    optionsContainer.innerHTML = '';

    if (type === 'mcq') {
        optionsContainer.innerHTML = `
            <div class="form-group">
                <label>MCQ Options</label>
                <div id="mcqOptions-${levelNumber}-${taskCount}">
                    ${[0,1,2,3].map(i => `
                        <div class="form-group">
                            <input type="radio" name="correct-${levelNumber}-${taskCount}" value="${i}" ${i===0?'checked':''}>
                            <input type="text" placeholder="Option ${i+1}" class="mcq-input" data-index="${i}" id="mcq-${levelNumber}-${taskCount}-${i}">
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

    // Add QR input field for manual entry (required)
    optionsContainer.innerHTML += `
        <div class="form-group">
            <label for="taskQr-${levelNumber}-${taskCount}">QR Value *</label>
            <input type="text" id="taskQr-${levelNumber}-${taskCount}" placeholder="Enter QR value" required>
        </div>`;
}

// --------------------
// Submit Event - robust version
// --------------------
async function handleCreateEvent(e) {
    e.preventDefault();

    try {
        const eventNameEl = document.getElementById('eventName');
        if (!eventNameEl) return alert('Event name input not found in DOM');
        const eventName = eventNameEl.value.trim();

        const eventDescription = (document.getElementById('eventDescription') || { value: '' }).value.trim();

        if (!eventName) return alert('Event name is required');

        const eventResp = await api.createEvent(eventName, eventDescription);
        if (!eventResp?.success) {
            console.error('createEvent failed:', eventResp);
            return alert('Failed to create event (API error)');
        }

        const eventId = eventResp.data.id;
        if (!eventId) throw new Error('No event id returned from API');

        // Iterate over existing level DOM nodes rather than numeric index to avoid gaps
        const levelsContainer = document.getElementById('levelsContainer');
        const levelDivs = Array.from(levelsContainer.querySelectorAll('.level-item'));

        for (const levelDiv of levelDivs) {
            // Extract level number from id 'level-<n>'
            const lvlParts = levelDiv.id.split('-');
            const lvlNumber = lvlParts[1];

            const levelName = (levelDiv.querySelector(`#levelName-${lvlNumber}`) || { value: `Level ${lvlNumber}` }).value.trim() || `Level ${lvlNumber}`;
            const levelDescription = (levelDiv.querySelector(`#levelDescription-${lvlNumber}`) || { value: '' }).value.trim();

            const levelResp = await api.addLevel(eventId, parseInt(lvlNumber), levelName, levelDescription);
            if (!levelResp?.success) {
                console.error('addLevel failed for', lvlNumber, levelResp);
                throw new Error('Failed to add level ' + lvlNumber);
            }

            const levelIdFromApi = levelResp.data.id; // for adding tasks

            // Get task items inside this level
            const taskDivs = Array.from(levelDiv.querySelectorAll('.task-item'));
            for (const taskDiv of taskDivs) {
                // parse task id 'task-<level>-<taskNumber>'
                const taskParts = taskDiv.id.split('-');
                const taskNumber = taskParts[2];

                const taskType = selectedTaskTypes[`${lvlNumber}-${taskNumber}`] || 'mcq';

                const questionEl = taskDiv.querySelector(`#taskQuestion-${lvlNumber}-${taskNumber}`) || { value: '' };
                const question = (questionEl.value || '').trim();

                const hintEl = taskDiv.querySelector(`#taskHint-${lvlNumber}-${taskNumber}`) || { value: '' };
                const hint = (hintEl.value || '').trim();

                // QR value is required
                const qrEl = taskDiv.querySelector(`#taskQr-${lvlNumber}-${taskNumber}`);
                if (!qrEl || !(qrEl.value || '').trim()) {
                    alert(`QR value is required for Level ${lvlNumber} Task ${taskNumber}`);
                    return; // abort create
                }
                const qrValue = qrEl.value.trim();

                let options = [];
                let correctAnswer = null;

                if (taskType === 'mcq') {
                    const mcqInputs = Array.from(taskDiv.querySelectorAll('.mcq-input'));
                    options = mcqInputs.map(i => (i.value || '').trim());

                    const selected = taskDiv.querySelector(`input[name="correct-${lvlNumber}-${taskNumber}"]:checked`);
                    if (!selected) {
                        alert(`Please select the correct answer for Level ${lvlNumber} Task ${taskNumber}`);
                        return;
                    }
                    correctAnswer = parseInt(selected.value);
                } else if (taskType === 'text') {
                    const txt = taskDiv.querySelector(`#textAnswer-${lvlNumber}-${taskNumber}`) || { value: '' };
                    correctAnswer = document.getElementById(`textAnswer-${lvlNumber}-${taskNumber}`).value
                                      .split(',').map(ans => ans.trim());
                    const caseSensitiveEl = taskDiv.querySelector(`#caseSensitive-${lvlNumber}-${taskNumber}`);
                    // store case sensitivity as part of answer object if needed
                    if (caseSensitiveEl) {
                        correctAnswer = { answer: correctAnswer, caseSensitive: caseSensitiveEl.checked };
                    }
                } else if (taskType === 'image') {
                    const imgOpt = taskDiv.querySelector(`#imageAnswer-${lvlNumber}-${taskNumber}`) || { value: '' };
                    correctAnswer = imgOpt.value;
                }

                // call api.addTask with the values
                try {
                    await api.addTask(levelIdFromApi, parseInt(taskNumber), taskType, question, options, correctAnswer, qrValue, hint);
                } catch (taskErr) {
                    console.error('addTask failed', taskErr);
                    throw taskErr;
                }
            }
        }

        alert('Event created successfully!');
        const eventForm = document.getElementById('eventForm');
        if (eventForm) eventForm.reset();
        initializeEventForm();
        showSection('events');
        await loadEvents();

    } catch (err) {
        console.error('Failed to create event:', err);
        alert('Failed to create event. Check console for details.');
    }
}

// --------------------
// Load Events
// --------------------
async function loadEvents() {
    const tbody = document.getElementById('eventsTableBody');
    if (!tbody) return console.error('Missing #eventsTableBody');
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

// Export functions to global scope (if bundling not used)
window.goToCreateEvent = goToCreateEvent;
window.initializeEventForm = initializeEventForm;
window.addLevel = addLevel;
window.removeLevel = removeLevel;
window.addTask = addTask;
window.removeTask = removeTask;
window.selectTaskType = selectTaskType;
window.handleCreateEvent = handleCreateEvent;
window.loadEvents = loadEvents;
window.viewEventDetails = viewEventDetails;
window.updateEvent = updateEvent;
window.deleteEvent = deleteEvent;
