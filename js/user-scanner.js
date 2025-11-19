// ../js/user-scanner.js

let qrScanner = null;
let scannerActive = false;

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
        <div class="task-question">
            <h4>${task.question}</h4>
        </div>
    `;

    if (task.type === 'mcq' && Array.isArray(task.options)) {
        html += `
            <div class="mcq-options">
                ${task.options.map((opt, i) => `
                    <label class="mcq-option">
                        <input type="radio" name="mcq-answer" value="${i}">
                        <span>${opt}</span>
                    </label>
                `).join('')}
            </div>
        `;
    } else if (task.type === 'text') {
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
            </div>
        `;
    }

    taskDetails.innerHTML = html;

    document.getElementById('currentLevel').textContent = task.level_id;
    document.getElementById('currentTask').textContent =
        task.task_number ?? task.id;

    modal.classList.add('active');
}

/**
 * Submit task answer via API
 */
async function submitTask() {
    const ctx = window.currentTaskContext;
    if (!ctx) return alert('No active task.');

    const { task, userEvent } = ctx;
    if (!userEvent) return alert('User event not found.');

    let answer = null;

    if (task.type === 'mcq') {
        const selected = document.querySelector('input[name="mcq-answer"]:checked');
        if (!selected) return alert('Please select an option');
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

        if (qrScanner && !scannerActive) initializeScanner();
    } catch (err) {
        console.error('Submit task error:', err);
        alert('❌ Failed to submit task: ' + (err?.message || 'Unknown error'));
    }
}


/**
 * Ignore continuous scan errors from camera scanning
 */
function onScanError(error) {
    // Optionally: console.warn('Scan error', error);
}
