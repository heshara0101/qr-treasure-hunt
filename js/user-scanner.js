<<<<<<< HEAD
// ../js/user-scanner.js
=======
// QR Code Scanner & Task Submission using APIClient
>>>>>>> 9d2d3fd10107955f01d64ad124785ad9889d0143

let qrScanner = null;
let scannerActive = false;

<<<<<<< HEAD
/**
 * Initialize the camera + scanner inside #reader
 */
function initializeScanner() {
    const reader = document.getElementById('reader');
    const resultDiv = document.getElementById('scanResult');

    if (!reader) {
        console.error('Reader element (#reader) not found');
        return;
    }

    if (scannerActive) {
        if (resultDiv) resultDiv.innerHTML = '';
        return;
    }

    if (typeof Html5Qrcode === 'undefined') {
        console.error('Html5Qrcode library is not loaded!');
        if (resultDiv) {
            resultDiv.className = 'scan-result error show';
            resultDiv.innerHTML = `
                <strong>Error:</strong> QR code library not loaded.
            `;
        }
        return;
    }

    reader.innerHTML = '';
    qrScanner = new Html5Qrcode('reader');

    qrScanner
        .start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            onQRCodeScanned,
            onScanError
        )
        .then(() => {
            scannerActive = true;
            if (resultDiv) {
                resultDiv.className = 'scan-result';
                resultDiv.innerHTML = '';
            }
        })
        .catch(err => {
            console.error('Unable to start scanner:', err);
            if (resultDiv) {
                resultDiv.className = 'scan-result error show';
                resultDiv.innerHTML = `
                    <strong>Error:</strong> Unable to access camera. Check permissions.
                `;
            }
        });
}

/**
 * Handle QR image upload
 */
async function handleImageUpload(e) {
    const fileInput = e.target;
    const file = fileInput.files[0];

    if (!file) return;

    try {
        if (typeof Html5Qrcode === 'undefined') {
            showScanError('QR code library not loaded.');
            return;
        }

        if (!qrScanner) {
            qrScanner = new Html5Qrcode('reader');
        }

        if (scannerActive) {
            await qrScanner.stop();
            scannerActive = false;
        }

        const decodedText = await qrScanner.scanFile(file, true);
        onQRCodeScanned(decodedText);
    } catch (err) {
        console.error('Image scan error:', err);
        showScanError('Could not read QR from image. Try another image.');
    } finally {
        fileInput.value = '';
    }
}

/**
 * Extract qr value:
 *  - "12345"                        -> "12345"
 *  - "http://..progress.php?...qr=12345" -> "12345"
 *  - "qr=12345"                     -> "12345"
 */
function extractQrValue(decodedText) {
    let raw = (decodedText || '').trim();
    if (!raw) return '';

    try {
        const url = new URL(raw);
        const v = url.searchParams.get('qr');
        if (v) return v;
    } catch (e) {}

    if (raw.includes('qr=')) {
        const qIndex = raw.indexOf('?');
        const query = qIndex !== -1 ? raw.substring(qIndex + 1) : raw;
        const params = new URLSearchParams(query);
        const v = params.get('qr');
        if (v) return v;
    }

    return raw;
}

/**
 * Called when html5-qrcode reads a QR code
 */
function onQRCodeScanned(decodedText, decodedResult) {
    console.log('QR decoded text =', decodedText);
    const qrValue = extractQrValue(decodedText);
    handleServerScan(qrValue);
}

/**
 * Call PHP handleScanQR + getProgress (for info), then show the task
 */
async function handleServerScan(qrValue) {
    const qr = (qrValue || '').trim();
    if (!qr) {
        showScanError('Invalid QR code');
        return;
    }

    try {
        // 1. Scan QR to get the task
        const scanResp = await api.scanQR(qr);
        if (!scanResp || !scanResp.success) {
            throw new Error(scanResp?.message || 'Invalid QR code');
        }
        const task = scanResp.data;

        // 2. Get user events (progress)
        const progressResp = await api.getProgress();
        if (!progressResp || !progressResp.success) {
            throw new Error(progressResp?.message || 'Unable to load current progress');
        }

        const userEvents = Array.isArray(progressResp.data) ? progressResp.data : [];

        // 3. Pick the correct userEvent matching the scanned task
        let userEvent = null;

        if (task.event_id) {
            userEvent = userEvents.find(ue => ue.event_id === task.event_id);
        }

        // If not found, fallback to first active event
        if (!userEvent && userEvents.length > 0) {
            userEvent = userEvents[0];
        }

        if (!userEvent) throw new Error('No active event found for this task');

        // Store for submitTask()
        window.currentTaskContext = { task, userEvent };

        console.log('task from scan-qr =', task);
        console.log('userEvent selected =', userEvent);

        if (qrScanner && scannerActive) {
            await qrScanner.stop();
            scannerActive = false;
        }

        showTask(task, userEvent);
    } catch (err) {
        console.error('QR scan error:', err);
        showScanError(err.message || 'Failed to process QR code');
    }
}


/**
 * Build and show the task modal using the task from PHP
 */
function showTask(task, userEvent) {
    // Store for submitTask()
    window.currentTaskContext = { task, userEvent };

    const modal = document.getElementById('taskModal');
    const taskDetails = document.getElementById('taskDetails');

    let html = `
=======
function initializeScanner() {
    if (scannerActive) return;

    if (typeof Html5Qrcode === 'undefined') {
        console.error('Html5Qrcode library is not loaded!');
        document.getElementById('scanResult').innerHTML = `
            <div class="scan-result error show">
                <strong>Error:</strong> QR code library not loaded.
            </div>
        `;
        return;
    }

    const reader = document.getElementById('reader');
    reader.innerHTML = '';

    qrScanner = new Html5Qrcode('reader');

    qrScanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onQRCodeScanned,
        onScanError
    ).then(() => {
        scannerActive = true;
    }).catch(err => {
        console.error('Unable to start scanner:', err);
        document.getElementById('scanResult').innerHTML = `
            <div class="scan-result error show">
                <strong>Error:</strong> Unable to access camera. Check permissions.
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
    // Ignore continuous scan errors
}

async function handleQRScan(qrData) {
    const userEventId = window.currentUserEventId;
    if (!userEventId) return showScanError('No active event');

    try {
        // Use API to get user event progress
        const progressResp = await api.getProgress(userEventId);
        if (!progressResp.success) throw new Error(progressResp.message);

        const userEvent = progressResp.data;

        const eventResp = await api.getEvent(userEvent.event_id);
        if (!eventResp.success) throw new Error(eventResp.message);
        const event = eventResp.data;

        // Check QR correctness
        if (qrData.level === userEvent.current_level_id && qrData.task === userEvent.current_task_id) {
            if (qrScanner && scannerActive) {
                await qrScanner.stop();
                scannerActive = false;
            }
            showTask(event, userEvent, qrData.level, qrData.task);
        } else {
            // Wrong QR - report to API
            await api.scanQR(JSON.stringify(qrData)); // Assuming API records wrong scans
            showScanError(`❌ Wrong QR Code! You scanned Level ${qrData.level} - Task ${qrData.task}. Complete Level ${userEvent.current_level_id} - Task ${userEvent.current_task_id} first.`);
        }
    } catch (err) {
        console.error('QR scan error:', err);
        showScanError(err.message);
    }
}

function showScanError(message) {
    const resultDiv = document.getElementById('scanResult');
    resultDiv.className = 'scan-result error show';
    resultDiv.innerHTML = `<strong>⚠️ ${message}</strong>`;
    setTimeout(() => resultDiv.classList.remove('show'), 5000);
}

function showTask(event, userEvent, levelNumber, taskNumber) {
    const level = event.levels.find(l => l.level_number === levelNumber);
    if (!level) return;

    const task = level.tasks.find(t => t.task_number === taskNumber);
    if (!task) return;

    window.currentTask = { task, level, userEvent, event };

    const modal = document.getElementById('taskModal');
    const taskDetails = document.getElementById('taskDetails');
    taskDetails.innerHTML = `
>>>>>>> 9d2d3fd10107955f01d64ad124785ad9889d0143
        <div class="task-question">
            <h4>${task.question}</h4>
        </div>
    `;

<<<<<<< HEAD
    if (task.type === 'mcq' && Array.isArray(task.options)) {
        html += `
            <div class="mcq-options">
                ${task.options.map((opt, i) => `
                    <label class="mcq-option">
                        <input type="radio" name="mcq-answer" value="${i}">
                        <span>${opt}</span>
=======
    if (task.type === 'mcq') {
        taskDetails.innerHTML += `
            <div class="mcq-options">
                ${task.options.map((opt, i) => `
                    <label>
                        <input type="radio" name="mcq-answer" value="${i}"> ${opt}
>>>>>>> 9d2d3fd10107955f01d64ad124785ad9889d0143
                    </label>
                `).join('')}
            </div>
        `;
    } else if (task.type === 'text') {
<<<<<<< HEAD
        html += `
            <div class="task-input">
                <input type="text"
                       id="textAnswer"
                       class="task-text-input"
                       placeholder="Your answer">
            </div>
        `;
    } else if (task.type === 'image') {
        html += `
            <div class="task-input">
                <input type="file"
                       id="imageUpload"
                       class="task-file-input"
                       accept="image/*">
=======
        taskDetails.innerHTML += `
            <div>
                <input type="text" id="textAnswer" placeholder="Your answer">
            </div>
        `;
    } else if (task.type === 'image') {
        taskDetails.innerHTML += `
            <div>
                <input type="file" id="imageUpload" accept="image/*">
>>>>>>> 9d2d3fd10107955f01d64ad124785ad9889d0143
            </div>
        `;
    }

<<<<<<< HEAD
    taskDetails.innerHTML = html;

    document.getElementById('currentLevel').textContent = task.level_id;
    document.getElementById('currentTask').textContent =
        task.task_number ?? task.id;
=======
    if (task.hint) {
        taskDetails.innerHTML += `
            <button onclick="showHint('${task.hint}')">💡 Show Hint</button>
            <div id="hintBox" class="task-hint">
                <div id="hintContent"></div>
            </div>
        `;
    }

    document.getElementById('currentLevel').textContent = levelNumber;
    document.getElementById('currentTask').textContent = taskNumber;
>>>>>>> 9d2d3fd10107955f01d64ad124785ad9889d0143

    modal.classList.add('active');
}

<<<<<<< HEAD
/**
 * Submit task answer via API
 */
async function submitTask() {
    const ctx = window.currentTaskContext;
    if (!ctx) return alert('No active task.');

    const { task, userEvent } = ctx;
    if (!userEvent) return alert('User event not found.');

=======
function showHint(hint) {
    const hintBox = document.getElementById('hintBox');
    document.getElementById('hintContent').textContent = hint;
    hintBox.classList.add('show');
}

async function submitTask() {
    const currentTaskObj = window.currentTask;
    if (!currentTaskObj) return;

    const { task, level, userEvent, event } = currentTaskObj;
>>>>>>> 9d2d3fd10107955f01d64ad124785ad9889d0143
    let answer = null;

    if (task.type === 'mcq') {
        const selected = document.querySelector('input[name="mcq-answer"]:checked');
        if (!selected) return alert('Please select an option');
<<<<<<< HEAD
        answer = task.options[selected.value];
    } else if (task.type === 'text') {
        const input = document.getElementById('textAnswer');
        if (!input || !input.value.trim()) return alert('Please enter your answer');
        answer = input.value.trim();
    } else if (task.type === 'image') {
        const fileInput = document.getElementById('imageUpload');
        if (!fileInput || !fileInput.files.length) return alert('Please upload an image');
        answer = 'image_uploaded';
    }

    try {
        const submitResp = await api.submitAnswer(
            task.id,
            task.level_id,
            userEvent.event_id,  // pass actual event ID
            answer,
            userEvent.id         // pass actual user_event ID
        );

        if (!submitResp.success) throw new Error(submitResp.message);

        alert('✓ Task submitted successfully!');
        if (typeof closeModal === 'function') closeModal();
        else document.getElementById('taskModal').classList.remove('active');

        if (typeof loadMyEvents === 'function') await loadMyEvents();
        if (typeof loadProgress === 'function') await loadProgress();
=======
        answer = parseInt(selected.value);
    } else if (task.type === 'text') {
        answer = document.getElementById('textAnswer').value.trim();
    } else if (task.type === 'image') {
        const fileInput = document.getElementById('imageUpload');
        if (fileInput.files.length === 0) return alert('Please upload an image');
        answer = 'image_uploaded'; // API can handle the file separately
    }

    try {
        const submitResp = await api.submitAnswer(task.id, level.id, event.id, answer);
        if (!submitResp.success) throw new Error(submitResp.message);

        alert('✓ Task submitted successfully!');
        closeModal();
        await loadMyEvents();
        await loadProgress();
>>>>>>> 9d2d3fd10107955f01d64ad124785ad9889d0143

        if (qrScanner && !scannerActive) initializeScanner();
    } catch (err) {
        console.error('Submit task error:', err);
<<<<<<< HEAD
        alert('❌ Failed to submit task: ' + (err?.message || 'Unknown error'));
    }
}


/**
 * Ignore continuous scan errors from camera scanning
 */
function onScanError(error) {
    // Optionally: console.warn('Scan error', error);
}
=======
        alert('❌ Failed to submit task: ' + err.message);
    }
}

// Observer to start scanner when scan section becomes active
window.addEventListener('DOMContentLoaded', () => {
    const observer = new MutationObserver(() => {
        const scanSection = document.getElementById('scan-qr');
        if (scanSection.classList.contains('active') && !scannerActive) {
            initializeScanner();
        }
    });

    observer.observe(document, { attributes: true, subtree: true });
});
>>>>>>> 9d2d3fd10107955f01d64ad124785ad9889d0143
