// User Progress Tracking

function loadProgress() {
    const userEvents = StorageManager.get('userEvents') || [];
    const events = StorageManager.get('events') || [];
    const currentUser = AuthManager.getCurrentUser();

    const progressContainer = document.getElementById('progressContainer');
    progressContainer.innerHTML = '';

    const userJoinedEvents = userEvents.filter(ue => ue.userId === currentUser.id);

    if (userJoinedEvents.length === 0) {
        progressContainer.innerHTML = '<p>Join an event to see your progress</p>';
        return;
    }

    userJoinedEvents.forEach(ue => {
        const event = events.find(e => e.id === ue.eventId);
        if (!event) return;

        const eventProgress = document.createElement('div');
        eventProgress.className = 'event-progress';

        let progressHTML = `<h3>${event.name}</h3>`;

        event.levels.forEach((level, levelIndex) => {
            const tasksCompleted = ue.completedTasks.filter(t => t.level === level.levelNumber).length;
            const taskTotal = level.tasks.length;
            const levelPercent = Math.round((tasksCompleted / taskTotal) * 100);

            progressHTML += `
                <div class="level-progress">
                    <div class="level-progress-header">
                        <span class="level-progress-label">
                            Level ${level.levelNumber}: ${level.name}
                        </span>
                        <span class="level-progress-percent">${levelPercent}%</span>
                    </div>
                    <div class="tasks-progress">
            `;

            level.tasks.forEach((task, taskIndex) => {
                const taskNum = taskIndex + 1;
                const isCompleted = ue.completedTasks.some(t => t.level === level.levelNumber && t.task === taskNum);
                const isCurrent = ue.currentLevel === level.levelNumber && ue.currentTask === taskNum;
                const isWrong = ue.status === 'wrong-qr' && ue.currentLevel === level.levelNumber && ue.currentTask === taskNum;

                let statusClass = 'not-started';
                if (isCompleted) {
                    statusClass = 'completed';
                } else if (isCurrent && !isWrong) {
                    statusClass = 'in-progress';
                } else if (isWrong) {
                    statusClass = 'wrong';
                }

                progressHTML += `
                    <div class="task-progress-item ${statusClass}" title="Task ${taskNum}">
                        ${statusClass === 'completed' ? '✓' : taskNum}
                    </div>
                `;
            });

            progressHTML += `
                    </div>
                </div>
            `;
        });

        // Add summary
        const totalTasks = event.levels.reduce((sum, level) => sum + level.tasks.length, 0);
        const completedTasks = ue.completedTasks.length;
        const totalPercent = Math.round((completedTasks / totalTasks) * 100);

        progressHTML += `
            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                <strong>Overall Progress: ${completedTasks}/${totalTasks} tasks (${totalPercent}%)</strong>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${totalPercent}%;"></div>
                </div>
                <p style="margin-top: 0.5rem; font-size: 0.9rem; color: var(--text-light);">
                    Status: <strong>${ue.status === 'completed' ? '✓ Completed' : '⏳ In Progress'}</strong>
                </p>
            </div>
        `;

        // Wrong QR alerts
        if (ue.wrongQRScans && ue.wrongQRScans.length > 0) {
            progressHTML += `
                <div style="margin-top: 1rem; padding: 0.75rem; background: #fee2e2; border-radius: 4px; border-left: 4px solid var(--danger-color);">
                    <strong style="color: #991b1b;">⚠️ Alert:</strong>
                    <p style="font-size: 0.9rem; margin-top: 0.25rem;">
                        ${ue.wrongQRScans.length} attempt(s) to scan incorrect QR code(s). Please complete all tasks in order!
                    </p>
                </div>
            `;
        }

        eventProgress.innerHTML = progressHTML;
        progressContainer.appendChild(eventProgress);
    });
}

function loadProfile() {
    const currentUser = AuthManager.getCurrentUser();
    const users = StorageManager.get('users') || [];
    const user = users.find(u => u.id === currentUser.id);

    if (!user) return;

    document.getElementById('profileName').value = user.fullname;
    document.getElementById('profileEmail').value = user.email;
    document.getElementById('profilePhone').value = user.phone || '';
}

function handleProfileUpdate(event) {
    event.preventDefault();

    const currentUser = AuthManager.getCurrentUser();
    const users = StorageManager.get('users') || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);

    if (userIndex === -1) return;

    users[userIndex].fullname = document.getElementById('profileName').value;
    users[userIndex].phone = document.getElementById('profilePhone').value;

    StorageManager.set('users', users);

    // Update current session user
    const updatedUser = { ...currentUser };
    updatedUser.fullname = users[userIndex].fullname;
    AuthManager.login(updatedUser);

    alert('Profile updated successfully');
    document.getElementById('userName').textContent = updatedUser.fullname;
}
