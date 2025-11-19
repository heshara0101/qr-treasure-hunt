/**
 * PHP API Client
 * Simple and Lightweight
 */

class APIClient {
    constructor(baseUrl = 'http://localhost/qr-treasure-hunt/api') {
<<<<<<< HEAD
        this.baseUrl = baseUrl.replace(/\/+$/, ''); // remove trailing slash
=======
        this.baseUrl = baseUrl;
>>>>>>> 9d2d3fd10107955f01d64ad124785ad9889d0143
        this.token = localStorage.getItem('token');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    async request(endpoint, method = 'GET', data = null) {
        const url = `${this.baseUrl}/${endpoint}`;
        const options = {
            method,
            headers: this.getHeaders()
        };

        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('API Error:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

<<<<<<< HEAD
    // ========== Authentication ==========

=======
    // Authentication
>>>>>>> 9d2d3fd10107955f01d64ad124785ad9889d0143
    async register(email, password, name, phone) {
        return this.request('auth.php?action=register', 'POST', {
            email,
            password,
            name,
            phone
        });
    }

    async login(email, password) {
        const result = await this.request('auth.php?action=login', 'POST', {
            email,
            password
        });

<<<<<<< HEAD
        if (result.success && result.data && result.data.token) {
=======
        if (result.success && result.data.token) {
>>>>>>> 9d2d3fd10107955f01d64ad124785ad9889d0143
            this.setToken(result.data.token);
        }

        return result;
    }

    async getUser() {
        return this.request('auth.php?action=get-user');
    }

<<<<<<< HEAD
    // ========== Events ==========

=======
    // Events
>>>>>>> 9d2d3fd10107955f01d64ad124785ad9889d0143
    async createEvent(title, description) {
        return this.request('events.php?action=create', 'POST', {
            title,
            description
        });
    }

    async listEvents() {
        return this.request('events.php?action=list');
    }

    async getEvent(id) {
        return this.request(`events.php?action=get&id=${id}`);
    }

    async updateEvent(id, title, description) {
        return this.request('events.php?action=update', 'POST', {
            id,
            title,
            description
        });
    }

    async deleteEvent(id) {
        return this.request(`events.php?action=delete&id=${id}`, 'DELETE');
    }

<<<<<<< HEAD
    // ========== Levels ==========

=======
    // Levels
>>>>>>> 9d2d3fd10107955f01d64ad124785ad9889d0143
    async addLevel(eventId, levelNumber, title, description) {
        return this.request('events.php?action=add-level', 'POST', {
            event_id: eventId,
            level_number: levelNumber,
            title,
            description
        });
    }

<<<<<<< HEAD
    // ========== Tasks ==========

    async addTask(levelId, taskNumber, type, question, options, correctAnswer, qr_value) {
=======
    // Tasks
    async addTask(levelId, taskNumber, type, question, options, correctAnswer,qr_value) {
>>>>>>> 9d2d3fd10107955f01d64ad124785ad9889d0143
        return this.request('events.php?action=add-task', 'POST', {
            level_id: levelId,
            task_number: taskNumber,
            type,
            question,
            options,
            correct_answer: correctAnswer,
            qr_value
        });
    }
<<<<<<< HEAD
    
     getEventResults(eventId) {
        return this.request(
            `admin.php?action=get-event-results&event_id=${eventId}`,
            "GET"
        );
    }

    // ========== Progress ==========

=======

    // Progress
>>>>>>> 9d2d3fd10107955f01d64ad124785ad9889d0143
    async joinEvent(eventId) {
        return this.request('progress.php?action=join-event', 'POST', {
            event_id: eventId
        });
    }

<<<<<<< HEAD
    // Your original: no argument, backend finds current user_event itself
    async getProgress() {
        return this.request('progress.php?action=get-progress');
    }

    /**
     * Submit answer
     *
     * IMPORTANT:
     *  - taskId MUST be used (task_id) or PHP will say "Missing required fields"
     *  - levelId -> level_id
     *  - eventId -> event_id
     *  - userEventId -> user_event_id
     *  - answer -> answer
     */
    async submitAnswer(taskId, levelId, eventId, answer, userEventId) {
        const payload = {
            task_id: taskId,
            level_id: levelId,
            event_id: eventId,
            user_event_id: userEventId,
            answer: answer
        };

        console.log('submitAnswer -> payload to PHP:', payload);

        return this.request('progress.php?action=submit-answer', 'POST', payload);
    }

    /**
     * Scan QR – progress.php?action=scan-qr&qr=...
     */
    scanQR(qrValue) {
        return this.request(
            `progress.php?action=scan-qr&qr=${encodeURIComponent(qrValue)}`
        );
    }
=======
    async getProgress() {
        return this.request(`progress.php?action=get-progress`);
    }

    async submitAnswer(taskId, levelId, eventId, answer) {
        return this.request('progress.php?action=submit-answer', 'POST', {
            task_id: taskId,
            level_id: levelId,
            event_id: eventId,
            answer
        });
    }

    async scanQR(qrValue) {
    return this.request(`progress.php?action=scan-qr&qr=${encodeURIComponent(qrValue)}`);
}

>>>>>>> 9d2d3fd10107955f01d64ad124785ad9889d0143

    async getResults(eventId) {
        return this.request(`progress.php?action=get-results&event_id=${eventId}`);
    }

<<<<<<< HEAD
    // ========== Admin ==========

=======
    // Admin
>>>>>>> 9d2d3fd10107955f01d64ad124785ad9889d0143
    async getEventResults(eventId) {
        return this.request(`admin.php?action=get-event-results&event_id=${eventId}`);
    }

    async getAllUsers() {
        return this.request('admin.php?action=get-all-users');
    }

    async getUserDetail(userId) {
        return this.request(`admin.php?action=get-user-detail&user_id=${userId}`);
    }

    async getEventStats(eventId) {
        return this.request(`admin.php?action=get-event-stats&event_id=${eventId}`);
    }
}

// Create global instance
const api = new APIClient();
