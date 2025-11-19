// QR Code Scanner & Task Submission using APIClient

let qrScanner = null;
let scannerActive = false;

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
        <div class="task-question">
            <h4>${task.question}</h4>
        </div>
    `;

    if (task.type === 'mcq') {
        taskDetails.innerHTML += `
            <div class="mcq-options">
                ${task.options.map((opt, i) => `
                    <label>
                        <input type="radio" name="mcq-answer" value="${i}"> ${opt}
                    </label>
                `).join('')}
            </div>
        `;
    } else if (task.type === 'text') {
        taskDetails.innerHTML += `
            <div>
                <input type="text" id="textAnswer" placeholder="Your answer">
            </div>
        `;
    } else if (task.type === 'image') {
        taskDetails.innerHTML += `
            <div>
                <input type="file" id="imageUpload" accept="image/*">
            </div>
        `;
    }

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

    modal.classList.add('active');
}

function showHint(hint) {
    const hintBox = document.getElementById('hintBox');
    document.getElementById('hintContent').textContent = hint;
    hintBox.classList.add('show');
}

async function submitTask() {
    const currentTaskObj = window.currentTask;
    if (!currentTaskObj) return;

    const { task, level, userEvent, event } = currentTaskObj;
    let answer = null;

    if (task.type === 'mcq') {
        const selected = document.querySelector('input[name="mcq-answer"]:checked');
        if (!selected) return alert('Please select an option');
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

        if (qrScanner && !scannerActive) initializeScanner();
    } catch (err) {
        console.error('Submit task error:', err);
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
