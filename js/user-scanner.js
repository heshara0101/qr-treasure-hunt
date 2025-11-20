// ../js/user-scanner.js

let qrScanner = null;
let scannerActive = false;

/**
 * Display scan errors to user
 */
function showScanError(message) {
    const resultDiv = document.getElementById('scanResult');
    if (resultDiv) {
        resultDiv.className = 'scan-result error show';
        resultDiv.innerHTML = `<strong>Error:</strong> ${message}`;
    } else {
        console.error('Scan error:', message);
    }
}

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

<<<<<<< HEAD
    // If scanner already running, just clear old messages
    if (scannerActive) {
        if (resultDiv) {
            resultDiv.className = 'scan-result';
            resultDiv.innerHTML = '';
        }
=======
    if (scannerActive) {
        if (resultDiv) resultDiv.innerHTML = '';
>>>>>>> 958f7b10019828e44836acf5ede2847adcf32b6d
        return;
    }

    if (typeof Html5Qrcode === 'undefined') {
        showScanError('QR code library not loaded.');
        return;
    }

<<<<<<< HEAD
    // Reset reader area
    reader.innerHTML = '';

    // Create / recreate scanner
=======
    reader.innerHTML = '';
>>>>>>> 958f7b10019828e44836acf5ede2847adcf32b6d
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
<<<<<<< HEAD
            if (err && (err.name === 'NotAllowedError' || err.name === 'PermissionDismissedError')) {
                showScanError('Camera permission denied. Please allow camera access.');
            } else {
                showScanError('Unable to access camera. Check permissions in your browser.');
=======
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDismissedError') {
                showScanError('Camera permission denied. Please allow camera access.');
            } else {
                showScanError('Unable to access camera. Check permissions.');
>>>>>>> 958f7b10019828e44836acf5ede2847adcf32b6d
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

<<<<<<< HEAD
        // Stop live scanner while scanning image
=======
>>>>>>> 958f7b10019828e44836acf5ede2847adcf32b6d
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
 * Extract QR code value from URL or raw text
 */
function extractQrValue(decodedText) {
    const raw = (decodedText || '').trim();
    if (!raw) return '';

<<<<<<< HEAD
    // If it's a full URL like https://.../?qr=XYZ
=======
>>>>>>> 958f7b10019828e44836acf5ede2847adcf32b6d
    try {
        const url = new URL(raw);
        const v = url.searchParams.get('qr');
        if (v) return v;
<<<<<<< HEAD
    } catch {
        // not a valid URL, continue
    }

    // If it's something containing qr= inside a string
=======
    } catch {}

>>>>>>> 958f7b10019828e44836acf5ede2847adcf32b6d
    if (raw.includes('qr=')) {
        const qIndex = raw.indexOf('?');
        const query = qIndex !== -1 ? raw.substring(qIndex + 1) : raw;
        const params = new URLSearchParams(query);
        const v = params.get('qr');
        if (v) return v;
    }

<<<<<<< HEAD
    // Otherwise treat raw text as value
=======
>>>>>>> 958f7b10019828e44836acf5ede2847adcf32b6d
    return raw;
}

/**
 * Called when a QR code is scanned
 */
function onQRCodeScanned(decodedText) {
    const qrValue = extractQrValue(decodedText);
    handleServerScan(qrValue);
}

/**
<<<<<<< HEAD
 * Pick an event for this task from user's events
 * - Prefer matching event_id (if present)
 * - Then prefer "active" event by status/is_active
 * - Else fall back to first joined event
 */
function pickUserEventForTask(task, userEvents) {
    if (!Array.isArray(userEvents) || userEvents.length === 0) {
        return null;
    }

    // 1. Try to use event_id from task, if backend sends it
    const taskEventId =
        task.event_id ??
        task.eventId ??
        (task.event && task.event.id) ??
        null;

    if (taskEventId != null) {
        const matched = userEvents.find(ue =>
            String(ue.event_id) === String(taskEventId) ||
            String(ue.id) === String(taskEventId)
        );
        if (matched) return matched;
    }

    // 2. Try to find an "active" event
    const activeEvent = userEvents.find(ue =>
        ue.is_active === 1 ||
        ue.is_active === true ||
        ue.status === 'active' ||
        ue.status === 'ACTIVE'
    );
    if (activeEvent) return activeEvent;

    // 3. Fallback: just use the first event the user joined
    return userEvents[0];
}

/**
=======
>>>>>>> 958f7b10019828e44836acf5ede2847adcf32b6d
 * Handle scanned QR code with API
 */
async function handleServerScan(qrValue) {
    const qr = (qrValue || '').trim();
    if (!qr) {
        showScanError('Invalid QR code');
        return;
    }

    try {
<<<<<<< HEAD
        // 1) Check if QR exists in system
=======
        // Check if QR exists in system
>>>>>>> 958f7b10019828e44836acf5ede2847adcf32b6d
        const scanResp = await api.scanQR(qr);
        if (!scanResp || !scanResp.success || !scanResp.data) {
            throw new Error(scanResp?.message || 'Invalid QR code');
        }
        const task = scanResp.data;

<<<<<<< HEAD
        // Normalise options if needed
        if (task.options && typeof task.options === 'string') {
            try {
                task.options = JSON.parse(task.options) || [];
            } catch {
                task.options = [];
            }
        } else if (!Array.isArray(task.options)) {
            task.options = [];
        }

        // 2) Get user progress to find matching event
=======
        // Get user progress to find matching event
>>>>>>> 958f7b10019828e44836acf5ede2847adcf32b6d
        const progressResp = await api.getProgress();
        if (!progressResp || !progressResp.success) {
            throw new Error(progressResp?.message || 'Unable to load current progress');
        }

        const userEvents = Array.isArray(progressResp.data) ? progressResp.data : [];
<<<<<<< HEAD

        // Choose an event for this task
        const userEvent = pickUserEventForTask(task, userEvents);

        if (!userEvent) {
            // User has no joined events at all
            throw new Error(
                'You have not joined any events yet. Please join an event first, then scan its QR codes.'
            );
        }

        // 3) Stop scanner after successful scan
=======
        let userEvent = userEvents.find(ue => ue.event_id === task.event_id);

        if (!userEvent) {
            throw new Error('No active event found for this task');
        }

        // Stop scanner after successful scan
>>>>>>> 958f7b10019828e44836acf5ede2847adcf32b6d
        if (qrScanner && scannerActive) {
            await qrScanner.stop();
            scannerActive = false;
        }

<<<<<<< HEAD
        // 4) Store task context for submission
        window.currentTaskContext = { task, userEvent };

        // 5) Show task modal
        showTask(task, userEvent);
=======
        // Store task context for submission
        window.currentTaskContext = { task, userEvent };

        // Show task modal
        showTask(task, userEvent);

>>>>>>> 958f7b10019828e44836acf5ede2847adcf32b6d
    } catch (err) {
        console.error('QR scan error:', err);
        showScanError(err.message || 'Failed to process QR code');
    }
}

/**
 * Display task modal
 */
function showTask(task, userEvent) {
    window.currentTaskContext = { task, userEvent };

    const modal = document.getElementById('taskModal');
    const taskDetails = document.getElementById('taskDetails');

    let html = `<div class="task-question"><h4>${task.question}</h4></div>`;

    if (task.type === 'mcq' && Array.isArray(task.options)) {
<<<<<<< HEAD
        html += `<div class="mcq-options">${task.options
            .map(
                (opt, i) => `
            <label class="mcq-option">
                <input type="radio" name="mcq-answer" value="${i}">
                <span>${opt}</span>
            </label>`
            )
            .join('')}</div>`;
    } else if (task.type === 'text') {
        html += `
            <div class="task-input">
                <input type="text" id="textAnswer" class="task-text-input" placeholder="Your answer">
            </div>`;
    } else if (task.type === 'image') {
        html += `
            <div class="task-input">
                <input type="file" id="imageUpload" class="task-file-input" accept="image/*">
            </div>`;
    }

    taskDetails.innerHTML = html;

    // Show level & task info
    document.getElementById('currentLevel').textContent = task.level_id;
    document.getElementById('currentTask').textContent =
        task.task_number ?? task.id;

=======
        html += `<div class="mcq-options">${task.options.map((opt, i) => `
            <label class="mcq-option">
                <input type="radio" name="mcq-answer" value="${i}">
                <span>${opt}</span>
            </label>`).join('')}</div>`;
    } else if (task.type === 'text') {
        html += `<div class="task-input"><input type="text" id="textAnswer" class="task-text-input" placeholder="Your answer"></div>`;
    } else if (task.type === 'image') {
        html += `<div class="task-input"><input type="file" id="imageUpload" class="task-file-input" accept="image/*"></div>`;
    }

    taskDetails.innerHTML = html;
    document.getElementById('currentLevel').textContent = task.level_id;
    document.getElementById('currentTask').textContent = task.task_number ?? task.id;
>>>>>>> 958f7b10019828e44836acf5ede2847adcf32b6d
    modal.classList.add('active');
}

/**
 * Submit task answer via API
 */
async function submitTask() {
    const ctx = window.currentTaskContext;
<<<<<<< HEAD
    if (!ctx) {
        alert('No active task.');
        return;
    }

    const { task, userEvent } = ctx;
    if (!userEvent) {
        alert('User event not found.');
        return;
    }

    let answer = null;

    if (task.type === 'mcq') {
        const selected = document.querySelector(
            'input[name="mcq-answer"]:checked'
        );
        if (!selected) {
            alert('Please select an option');
            return;
        }
        answer = task.options[selected.value];
    } else if (task.type === 'text') {
        const input = document.getElementById('textAnswer');
        if (!input || !input.value.trim()) {
            alert('Please enter your answer');
            return;
        }
        answer = input.value.trim();
    } else if (task.type === 'image') {
        const fileInput = document.getElementById('imageUpload');
        if (!fileInput || !fileInput.files.length) {
            alert('Please upload an image');
            return;
        }
        // You may later handle actual file upload here
=======
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
>>>>>>> 958f7b10019828e44836acf5ede2847adcf32b6d
        answer = 'image_uploaded';
    }

    try {
<<<<<<< HEAD
        // Fallback to userEvent.id if event_id is missing in userEvent
        const eventIdForSubmit = userEvent.event_id || userEvent.id;

        const submitResp = await api.submitAnswer(
            task.id,
            task.level_id,
            eventIdForSubmit,
            answer,
            userEvent.id
        );

        if (!submitResp.success) {
            throw new Error(submitResp.message);
        }

        alert('✓ Task submitted successfully!');

        if (typeof closeModal === 'function') {
            closeModal();
        } else {
            const modal = document.getElementById('taskModal');
            if (modal) modal.classList.remove('active');
        }

        // Refresh UI data if those functions exist
        if (typeof loadMyEvents === 'function') {
            await loadMyEvents();
        }
        if (typeof loadProgress === 'function') {
            await loadProgress();
        }

        // Restart scanner so user can scan next QR
        if (qrScanner && !scannerActive) {
            initializeScanner();
        }
=======
        const submitResp = await api.submitAnswer(task.id, task.level_id, userEvent.event_id, answer, userEvent.id);
        if (!submitResp.success) throw new Error(submitResp.message);

        alert('✓ Task submitted successfully!');
        if (typeof closeModal === 'function') closeModal();
        else document.getElementById('taskModal').classList.remove('active');

        if (typeof loadMyEvents === 'function') await loadMyEvents();
        if (typeof loadProgress === 'function') await loadProgress();

        if (qrScanner && !scannerActive) initializeScanner();

>>>>>>> 958f7b10019828e44836acf5ede2847adcf32b6d
    } catch (err) {
        console.error('Submit task error:', err);
        alert('❌ Failed to submit task: ' + (err?.message || 'Unknown error'));
    }
}

/**
 * Ignore continuous scan errors from camera
 */
function onScanError(error) {
<<<<<<< HEAD
    if (!error) return;

    // Only show camera permission-like errors if they appear here
    if (
        typeof error === 'object' &&
        (error.name === 'NotAllowedError' || error.name === 'PermissionDismissedError')
    ) {
        showScanError('Camera permission denied. Please allow access.');
    }
    // For normal decoding failures, do nothing (too noisy otherwise)
    // console.warn('Scan error:', error);
=======
    // Only show camera permission errors
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDismissedError') {
        showScanError('Camera permission denied. Please allow access.');
    }
>>>>>>> 958f7b10019828e44836acf5ede2847adcf32b6d
}
