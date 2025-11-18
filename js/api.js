// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

class StorageManager {
    static set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    static get(key) {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    }

    static remove(key) {
        localStorage.removeItem(key);
    }

    static clear() {
        localStorage.clear();
    }
}

class AuthManager {
    static async register(fullname, email, phone, password, confirmPassword) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullname, email, phone, password, confirmPassword })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // Store token
            StorageManager.set('token', data.token);
            StorageManager.set('currentUser', data.user);

            return { success: true, user: data.user };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message };
        }
    }

    static async login(email, password, role = 'user') {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Store token and user
            StorageManager.set('token', data.token);
            StorageManager.set('currentUser', data.user);

            return { success: true, user: data.user };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    }

    static async logout() {
        try {
            const token = StorageManager.get('token');
            if (token) {
                await fetch(`${API_BASE_URL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            StorageManager.remove('token');
            StorageManager.remove('currentUser');
            window.location.href = '/index.html';
        }
    }

    static getCurrentUser() {
        return StorageManager.get('currentUser');
    }

    static getToken() {
        return StorageManager.get('token');
    }

    static isLoggedIn() {
        return !!this.getToken();
    }

    static isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    }

    static isUser() {
        const user = this.getCurrentUser();
        return user && user.role === 'user';
    }

    static getAuthHeader() {
        const token = this.getToken();
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }
}

class APIManager {
    // EVENTS
    static async createEvent(name, description) {
        try {
            const response = await fetch(`${API_BASE_URL}/events`, {
                method: 'POST',
                headers: AuthManager.getAuthHeader(),
                body: JSON.stringify({ name, description })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            return await response.json();
        } catch (error) {
            console.error('Create event error:', error);
            throw error;
        }
    }

    static async getEvents() {
        try {
            const response = await fetch(`${API_BASE_URL}/events`, {
                headers: AuthManager.getAuthHeader()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }

            return await response.json();
        } catch (error) {
            console.error('Get events error:', error);
            throw error;
        }
    }

    static async getEventById(eventId) {
        try {
            const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
                headers: AuthManager.getAuthHeader()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch event');
            }

            return await response.json();
        } catch (error) {
            console.error('Get event error:', error);
            throw error;
        }
    }

    static async updateEvent(eventId, name, description, status) {
        try {
            const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
                method: 'PUT',
                headers: AuthManager.getAuthHeader(),
                body: JSON.stringify({ name, description, status })
            });

            if (!response.ok) {
                throw new Error('Failed to update event');
            }

            return await response.json();
        } catch (error) {
            console.error('Update event error:', error);
            throw error;
        }
    }

    static async deleteEvent(eventId) {
        try {
            const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
                method: 'DELETE',
                headers: AuthManager.getAuthHeader()
            });

            if (!response.ok) {
                throw new Error('Failed to delete event');
            }

            return await response.json();
        } catch (error) {
            console.error('Delete event error:', error);
            throw error;
        }
    }

    // LEVELS
    static async addLevel(eventId, levelNumber, name, description) {
        try {
            const response = await fetch(`${API_BASE_URL}/events/${eventId}/levels`, {
                method: 'POST',
                headers: AuthManager.getAuthHeader(),
                body: JSON.stringify({ levelNumber, name, description })
            });

            if (!response.ok) {
                throw new Error('Failed to add level');
            }

            return await response.json();
        } catch (error) {
            console.error('Add level error:', error);
            throw error;
        }
    }

    static async deleteLevel(levelId) {
        try {
            const response = await fetch(`${API_BASE_URL}/levels/${levelId}`, {
                method: 'DELETE',
                headers: AuthManager.getAuthHeader()
            });

            if (!response.ok) {
                throw new Error('Failed to delete level');
            }

            return await response.json();
        } catch (error) {
            console.error('Delete level error:', error);
            throw error;
        }
    }

    // TASKS
    static async addTask(eventId, levelId, taskNumber, type, question, hint, options, correctOption, correctAnswer) {
        try {
            const response = await fetch(`${API_BASE_URL}/events/${eventId}/levels/${levelId}/tasks`, {
                method: 'POST',
                headers: AuthManager.getAuthHeader(),
                body: JSON.stringify({ taskNumber, type, question, hint, options, correctOption, correctAnswer })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            return await response.json();
        } catch (error) {
            console.error('Add task error:', error);
            throw error;
        }
    }

    static async deleteTask(taskId) {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
                method: 'DELETE',
                headers: AuthManager.getAuthHeader()
            });

            if (!response.ok) {
                throw new Error('Failed to delete task');
            }

            return await response.json();
        } catch (error) {
            console.error('Delete task error:', error);
            throw error;
        }
    }

    // PROGRESS & USER EVENTS
    static async joinEvent(eventId) {
        try {
            const response = await fetch(`${API_BASE_URL}/events/${eventId}/join`, {
                method: 'POST',
                headers: AuthManager.getAuthHeader()
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            return await response.json();
        } catch (error) {
            console.error('Join event error:', error);
            throw error;
        }
    }

    static async getUserEvents() {
        try {
            const response = await fetch(`${API_BASE_URL}/user-events`, {
                headers: AuthManager.getAuthHeader()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user events');
            }

            return await response.json();
        } catch (error) {
            console.error('Get user events error:', error);
            throw error;
        }
    }

    static async scanQR(userEventId, qrData) {
        try {
            const response = await fetch(`${API_BASE_URL}/user-events/${userEventId}/scan-qr`, {
                method: 'POST',
                headers: AuthManager.getAuthHeader(),
                body: JSON.stringify({ qrData })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            return data;
        } catch (error) {
            console.error('Scan QR error:', error);
            throw error;
        }
    }

    static async submitTask(userEventId, taskId, answer) {
        try {
            const response = await fetch(`${API_BASE_URL}/user-events/${userEventId}/submit-task`, {
                method: 'POST',
                headers: AuthManager.getAuthHeader(),
                body: JSON.stringify({ taskId, answer })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            return data;
        } catch (error) {
            console.error('Submit task error:', error);
            throw error;
        }
    }

    static async getProgress(userEventId) {
        try {
            const response = await fetch(`${API_BASE_URL}/user-events/${userEventId}/progress`, {
                headers: AuthManager.getAuthHeader()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch progress');
            }

            return await response.json();
        } catch (error) {
            console.error('Get progress error:', error);
            throw error;
        }
    }

    static async getEventResults(eventId) {
        try {
            const response = await fetch(`${API_BASE_URL}/events/${eventId}/results`, {
                headers: AuthManager.getAuthHeader()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch results');
            }

            return await response.json();
        } catch (error) {
            console.error('Get results error:', error);
            throw error;
        }
    }
}
