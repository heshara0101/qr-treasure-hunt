// Admin Event Management Functions

let currentEvent = null;
let levelCount = 0;

function goToCreateEvent() {
    showSection('create-event');
    initializeEventForm();
}

function initializeEventForm() {
    levelCount = 0;
    document.getElementById('levelsContainer').innerHTML = '';
    addLevel();
}

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
    if (levelDiv) {
        levelDiv.remove();
    }
}

let taskCountPerLevel = {};

function addTask(levelNumber) {
    if (!taskCountPerLevel[levelNumber]) {
        taskCountPerLevel[levelNumber] = 0;
    }
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
                    <button type="button" class="task-type-btn active" onclick="selectTaskType(${levelNumber}, ${taskCount}, 'mcq')">MCQ</button>
                    <button type="button" class="task-type-btn" onclick="selectTaskType(${levelNumber}, ${taskCount}, 'image')">Image Upload</button>
                    <button type="button" class="task-type-btn" onclick="selectTaskType(${levelNumber}, ${taskCount}, 'text')">Text Input</button>
                </div>
            </div>

            <div class="form-group">
                <label for="taskQuestion-${levelNumber}-${taskCount}">Question/Description</label>
                <textarea id="taskQuestion-${levelNumber}-${taskCount}" rows="2" placeholder="Enter the task question or description"></textarea>
            </div>

            <div id="taskOptions-${levelNumber}-${taskCount}">
                <!-- Options will be rendered based on task type -->
            </div>

            <div class="form-group">
                <label for="taskHint-${levelNumber}-${taskCount}">Hint (for next QR location)</label>
                <input type="text" id="taskHint-${levelNumber}-${taskCount}" placeholder="Hint to help users find next QR code">
            </div>
        </div>
        <button type="button" class="btn btn-danger" onclick="removeTask(${levelNumber}, ${taskCount})">Remove</button>
    `;

    tasksContainer.appendChild(taskDiv);
    selectTaskType(levelNumber, taskCount, 'mcq'); // Initialize with MCQ
}

function removeTask(levelNumber, taskCount) {
    const taskDiv = document.getElementById(`task-${levelNumber}-${taskCount}`);
    if (taskDiv) {
        taskDiv.remove();
    }
}

let selectedTaskTypes = {};

function selectTaskType(levelNumber, taskCount, type) {
    selectedTaskTypes[`${levelNumber}-${taskCount}`] = type;

    // Update button states
    const buttons = document.querySelectorAll(`#task-${levelNumber}-${taskCount} .task-type-btn`);
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Render options based on type
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
                    <div class="form-group">
                        <input type="radio" name="correct-${levelNumber}-${taskCount}" value="0" checked>
                        <input type="text" placeholder="Option 1" class="mcq-input" data-index="0">
                    </div>
                    <div class="form-group">
                        <input type="radio" name="correct-${levelNumber}-${taskCount}" value="1">
                        <input type="text" placeholder="Option 2" class="mcq-input" data-index="1">
                    </div>
                    <div class="form-group">
                        <input type="radio" name="correct-${levelNumber}-${taskCount}" value="2">
                        <input type="text" placeholder="Option 3" class="mcq-input" data-index="2">
                    </div>
                    <div class="form-group">
                        <input type="radio" name="correct-${levelNumber}-${taskCount}" value="3">
                        <input type="text" placeholder="Option 4" class="mcq-input" data-index="3">
                    </div>
                </div>
            </div>
        `;
    } else if (type === 'image') {
        optionsContainer.innerHTML = `
            <div class="form-group">
                <label for="imageAnswer-${levelNumber}-${taskCount}">Expected Image Format</label>
                <select id="imageAnswer-${levelNumber}-${taskCount}">
                    <option>User uploads image</option>
                    <option>Exact image matching</option>
                    <option>Image content verification</option>
                </select>
            </div>
        `;
    } else if (type === 'text') {
        optionsContainer.innerHTML = `
            <div class="form-group">
                <label for="textAnswer-${levelNumber}-${taskCount}">Correct Answer (Text)</label>
                <input type="text" id="textAnswer-${levelNumber}-${taskCount}" placeholder="Enter the correct answer">
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="caseSensitive-${levelNumber}-${taskCount}">
                    Case Sensitive
                </label>
            </div>
        `;
    }
}

function handleCreateEvent(event) {
    event.preventDefault();

    const eventName = document.getElementById('eventName').value;
    const eventDescription = document.getElementById('eventDescription').value;

    if (!eventName) {
        alert('Event name is required');
        return;
    }

    // Collect levels and tasks
    const levels = [];
    for (let i = 1; i <= levelCount; i++) {
        const levelDiv = document.getElementById(`level-${i}`);
        if (!levelDiv) continue;

        const levelName = document.getElementById(`levelName-${i}`).value || `Level ${i}`;
        const levelDescription = document.getElementById(`levelDescription-${i}`).value;

        const tasks = [];
        const tasksContainer = document.getElementById(`tasks-${i}`);
        const taskDivs = tasksContainer.querySelectorAll('.task-item');

        taskDivs.forEach((taskDiv, index) => {
            const taskType = selectedTaskTypes[`${i}-${index + 1}`] || 'mcq';
            const question = document.getElementById(`taskQuestion-${i}-${index + 1}`).value;
            const hint = document.getElementById(`taskHint-${i}-${index + 1}`).value;

            let taskData = {
                id: Date.now().toString() + Math.random(),
                type: taskType,
                question,
                hint,
                taskNumber: index + 1
            };

            if (taskType === 'mcq') {
                const correctOption = document.querySelector(`input[name="correct-${i}-${index + 1}"]:checked`).value;
                const options = Array.from(document.querySelectorAll(`#taskOptions-${i}-${index + 1} .mcq-input`))
                    .map(input => input.value);
                taskData.options = options;
                taskData.correctOption = parseInt(correctOption);
            } else if (taskType === 'text') {
                taskData.correctAnswer = document.getElementById(`textAnswer-${i}-${index + 1}`).value;
                taskData.caseSensitive = document.getElementById(`caseSensitive-${i}-${index + 1}`).checked;
            }

            // Generate QR Code for this task
            taskData.qrCode = generateQRData(eventName, i, index + 1);

            tasks.push(taskData);
        });

        levels.push({
            id: `level-${i}`,
            levelNumber: i,
            name: levelName,
            description: levelDescription,
            tasks
        });
    }

    // Create event object
    const newEvent = {
        id: Date.now().toString(),
        name: eventName,
        description: eventDescription,
        levels,
        createdBy: AuthManager.getCurrentUser().id,
        createdAt: new Date().toISOString(),
        status: 'active',
        participants: 0
    };

    // Save event
    let events = StorageManager.get('events') || [];
    events.push(newEvent);
    StorageManager.set('events', events);

    alert('Event created successfully!');
    
    // Reset form
    document.getElementById('eventForm').reset();
    initializeEventForm();
    
    // Go to events section
    showSection('events');
    loadEvents();
}

function generateQRData(eventName, levelNumber, taskNumber) {
    // Generate unique QR data
    const qrData = {
        event: eventName,
        level: levelNumber,
        task: taskNumber,
        timestamp: Date.now()
    };
    return JSON.stringify(qrData);
}

function loadEvents() {
    const events = StorageManager.get('events') || [];
    const tbody = document.getElementById('eventsTableBody');
    tbody.innerHTML = '';

    if (events.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No events yet</td></tr>';
        return;
    }

    events.forEach(event => {
        const row = document.createElement('tr');
        const createdDate = new Date(event.createdAt).toLocaleDateString();
        
        row.innerHTML = `
            <td><strong>${event.name}</strong></td>
            <td>${event.levels.length}</td>
            <td>${createdDate}</td>
            <td><span class="status-badge status-active">${event.status}</span></td>
            <td>${event.participants}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view-btn" onclick="viewEventDetails('${event.id}')">View</button>
                    <button class="action-btn edit-btn" onclick="editEvent('${event.id}')">Edit</button>
                    <button class="action-btn delete-btn" onclick="deleteEvent('${event.id}')">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function viewEventDetails(eventId) {
    const events = StorageManager.get('events') || [];
    const event = events.find(e => e.id === eventId);

    if (!event) return;

    const modal = document.getElementById('eventModal');
    const modalBody = document.getElementById('modalBody');

    let detailsHTML = `
        <div class="results-detail">
            <div class="result-item">
                <span class="result-label">Event Name:</span>
                <span class="result-value">${event.name}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Description:</span>
                <span class="result-value">${event.description}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Levels:</span>
                <span class="result-value">${event.levels.length}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Participants:</span>
                <span class="result-value">${event.participants}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Status:</span>
                <span class="result-value">${event.status}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Created:</span>
                <span class="result-value">${new Date(event.createdAt).toLocaleDateString()}</span>
            </div>
    `;

    // Add levels details
    detailsHTML += '<h4 style="margin-top: 1rem; margin-bottom: 0.5rem;">Levels:</h4>';
    event.levels.forEach(level => {
        detailsHTML += `
            <div style="margin-left: 1rem; padding: 0.5rem; background: var(--light-bg); border-radius: 4px; margin-bottom: 0.5rem;">
                <strong>Level ${level.levelNumber}: ${level.name}</strong> (${level.tasks.length} tasks)
            </div>
        `;
    });

    detailsHTML += '</div>';
    modalBody.innerHTML = detailsHTML;
    modal.classList.add('active');
}

function editEvent(eventId) {
    alert('Edit functionality coming soon');
}

function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event?')) return;

    let events = StorageManager.get('events') || [];
    events = events.filter(e => e.id !== eventId);
    StorageManager.set('events', events);

    loadEvents();
}
