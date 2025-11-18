// QR Code Scanner & Task Submission

let qrScanner = null;
let scannerActive = false;

function initializeScanner() {
    if (scannerActive) return;

    const reader = document.getElementById('reader');
    reader.innerHTML = ''; // Clear previous

    qrScanner = new Html5Qrcode('reader');
    
    qrScanner.start(
        { facingMode: 'environment' },
        {
            fps: 10,
            qrbox: { width: 250, height: 250 }
        },
        onQRCodeScanned,
        onScanError
    ).then(() => {
        scannerActive = true;
    }).catch(err => {
        console.log('Unable to start scanner:', err);
        document.getElementById('scanResult').innerHTML = `
            <div class="scan-result error show">
                <strong>Error:</strong> Unable to access camera. Please check permissions.
            </div>
        `;
    });
}

function onQRCodeScanned(decodedText) {
    try {
        const qrData = JSON.parse(decodedText);
        handleQRScan(qrData);
    } catch (e) {
        showScanError('Invalid QR code format');
    }
}

function onScanError(error) {
    // Suppress errors from continuous scanning
}

function handleQRScan(qrData) {
    const userEvents = StorageManager.get('userEvents') || [];
    const events = StorageManager.get('events') || [];
    const userEventId = window.currentUserEventId;

    if (!userEventId) {
        showScanError('No active event');
        return;
    }

    const userEvent = userEvents.find(ue => ue.id === userEventId);
    const event = events.find(e => e.id === userEvent.eventId);

    if (!event) {
        showScanError('Event not found');
        return;
    }

    // Check if QR code matches current position
    if (qrData.level === userEvent.currentLevel && qrData.task === userEvent.currentTask) {
        // Correct QR code - show task
        if (qrScanner && scannerActive) {
            qrScanner.stop().then(() => {
                scannerActive = false;
            });
        }
        showTask(event, userEvent, qrData.level, qrData.task);
    } else {
        // Wrong QR code - alert user
        const wrongScan = {
            attemptedLevel: qrData.level,
            attemptedTask: qrData.task,
            timestamp: new Date().toISOString()
        };

        userEvent.wrongQRScans.push(wrongScan);
        userEvent.status = 'wrong-qr';

        StorageManager.set('userEvents', userEvents);

        showScanError(
            `❌ Wrong QR Code!\n\n` +
            `You scanned: Level ${qrData.level} - Task ${qrData.task}\n` +
            `You need to complete: Level ${userEvent.currentLevel} - Task ${userEvent.currentTask}\n\n` +
            `Complete the current task first!`
        );
    }
}

function showScanError(message) {
    const resultDiv = document.getElementById('scanResult');
    resultDiv.className = 'scan-result error show';
    resultDiv.innerHTML = `<strong>⚠️ ${message}</strong>`;
    setTimeout(() => {
        resultDiv.classList.remove('show');
    }, 5000);
}

function showTask(event, userEvent, levelNumber, taskNumber) {
    const level = event.levels.find(l => l.levelNumber === levelNumber);
    if (!level) return;

    const task = level.tasks[taskNumber - 1];
    if (!task) return;

    window.currentTask = { task, level, userEvent, event };

    const modal = document.getElementById('taskModal');
    const taskDetails = document.getElementById('taskDetails');
    const taskForm = document.getElementById('taskForm');

    document.getElementById('currentLevel').textContent = levelNumber;
    document.getElementById('currentTask').textContent = taskNumber;

    taskDetails.innerHTML = `
        <div class="task-question">
            <h4>${task.question}</h4>
    `;

    if (task.type === 'mcq') {
        taskDetails.innerHTML += `
            <div class="mcq-options">
                ${task.options.map((option, index) => `
                    <label class="mcq-option">
                        <input type="radio" name="mcq-answer" value="${index}">
                        ${option}
                    </label>
                `).join('')}
            </div>
        `;
    } else if (task.type === 'image') {
        taskDetails.innerHTML += `
            <div class="form-group">
                <label for="imageUpload">Upload Image:</label>
                <input type="file" id="imageUpload" accept="image/*">
            </div>
        `;
    } else if (task.type === 'text') {
        taskDetails.innerHTML += `
            <div class="form-group">
                <label for="textAnswer">Your Answer:</label>
                <input type="text" id="textAnswer" placeholder="Enter your answer">
            </div>
        `;
    }

    taskDetails.innerHTML += '</div>';

    if (task.hint) {
        taskDetails.innerHTML += `
            <button class="hint-button" onclick="showHint('${task.hint}')">💡 Show Hint</button>
            <div class="task-hint" id="hintBox">
                <div class="hint-title">Hint for next QR location:</div>
                <div id="hintContent"></div>
            </div>
        `;
    }

    modal.classList.add('active');
}

function showHint(hint) {
    const hintBox = document.getElementById('hintBox');
    const hintContent = document.getElementById('hintContent');
    hintContent.textContent = hint;
    hintBox.classList.add('show');
}

function submitTask() {
    const currentTask = window.currentTask;
    if (!currentTask) return;

    const { task, level, userEvent, event } = currentTask;
    let isCorrect = false;

    if (task.type === 'mcq') {
        const selected = document.querySelector('input[name="mcq-answer"]:checked');
        if (!selected) {
            alert('Please select an option');
            return;
        }
        isCorrect = parseInt(selected.value) === task.correctOption;
    } else if (task.type === 'text') {
        const answer = document.getElementById('textAnswer').value.trim();
        const correctAnswer = task.caseSensitive ? task.correctAnswer : task.correctAnswer.toLowerCase();
        const userAnswer = task.caseSensitive ? answer : answer.toLowerCase();
        isCorrect = userAnswer === correctAnswer;
    } else if (task.type === 'image') {
        // For demo, accept any image
        const fileInput = document.getElementById('imageUpload');
        isCorrect = fileInput.files.length > 0;
    }

    if (isCorrect) {
        // Mark task as completed
        userEvent.completedTasks.push({ level: level.levelNumber, task: task.taskNumber });

        // Move to next task
        const currentLevelTasks = level.tasks.length;
        if (userEvent.currentTask < currentLevelTasks) {
            userEvent.currentTask++;
            userEvent.status = 'in-progress';
        } else {
            // Move to next level
            if (userEvent.currentLevel < event.levels.length) {
                userEvent.currentLevel++;
                userEvent.currentTask = 1;
                userEvent.status = 'in-progress';
            } else {
                // Event completed
                userEvent.status = 'completed';
                userEvent.completedAt = new Date().toISOString();
            }
        }

        const userEvents = StorageManager.get('userEvents') || [];
        const index = userEvents.findIndex(ue => ue.id === userEvent.id);
        if (index >= 0) {
            userEvents[index] = userEvent;
            StorageManager.set('userEvents', userEvents);
        }

        alert('✓ Correct Answer! Moving to next task.');
        closeModal();
        loadMyEvents();
        loadProgress();

        if (qrScanner && !scannerActive) {
            initializeScanner();
        }
    } else {
        alert('❌ Incorrect answer. Try again!');
    }
}

// Scanner section observer
window.addEventListener('DOMContentLoaded', () => {
    const observer = new MutationObserver((mutations) => {
        const scanSection = document.getElementById('scan-qr');
        if (scanSection.classList.contains('active') && !scannerActive) {
            initializeScanner();
        }
    });

    observer.observe(document, { attributes: true, subtree: true });
});
