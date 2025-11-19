// user-progress.js
// User Progress & Profile Management using APIClient

async function loadProgress() {
    const progressContainer = document.getElementById('progressContainer');
    progressContainer.innerHTML = '<p>Loading progress...</p>';

    try {
        // 1. Get current user
        const userResp = await api.getUser();
        if (!userResp.success) throw new Error(userResp.message);
        const currentUser = userResp.data;

        // 2. Get all user joined events
        const joinedEventsResp = await api.getProgress(); // safer: reuse existing getProgress API
        if (!joinedEventsResp.success) throw new Error(joinedEventsResp.message);
        const userEvents = joinedEventsResp.data || [];

        if (userEvents.length === 0) {
            progressContainer.innerHTML = '<p>Join an event to see your progress</p>';
            return;
        }

        progressContainer.innerHTML = '';

        for (const ue of userEvents) {
            const eventId = ue.event_id || ue.id;
            if (!eventId) continue;

            // 3. Get event details
            const eventResp = await api.getEvent(eventId);
            if (!eventResp.success || !eventResp.data) continue;

            const event = eventResp.data;

            const eventProgress = document.createElement('div');
            eventProgress.className = 'event-progress';

            let progressHTML = `<h3>${event.title}</h3>`;

            for (const level of event.levels || []) {
                const levelId = level.id || level.level_id;
                const tasksCompleted = ue.completed_tasks?.filter(t => t.level_id === levelId).length || 0;
                const taskTotal = level.tasks?.length || 0;
                const levelPercent = taskTotal ? Math.round((tasksCompleted / taskTotal) * 100) : 0;

                progressHTML += `
                    <div class="level-progress">
                        <div class="level-progress-header">
                            <span class="level-progress-label">Level ${level.level_number}: ${level.title}</span>
                            <span class="level-progress-percent">${levelPercent}%</span>
                        </div>
                        <div class="tasks-progress">
                `;

                for (let i = 0; i < (level.tasks?.length || 0); i++) {
                    const task = level.tasks[i];
                    const taskNum = i + 1;
                    const isCompleted = ue.completed_tasks?.some(t => t.level_id === levelId && t.task_id === task.id);
                    const isCurrent = ue.current_level_id === levelId && ue.current_task_id === task.id;
                    const isWrong = ue.status === 'wrong-qr' && isCurrent;

                    let statusClass = 'not-started';
                    if (isCompleted) statusClass = 'completed';
                    else if (isCurrent && !isWrong) statusClass = 'in-progress';
                    else if (isWrong) statusClass = 'wrong';

                    progressHTML += `<div class="task-progress-item ${statusClass}" title="Task ${taskNum}">${statusClass === 'completed' ? '✓' : taskNum}</div>`;
                }

                progressHTML += `</div></div>`;
            }

            // Overall progress
            const totalTasks = (event.levels || []).reduce((sum, l) => sum + (l.tasks?.length || 0), 0);
            const completedTasks = ue.completed_tasks?.length || 0;
            const totalPercent = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

            progressHTML += `
                <div style="margin-top:1rem; border-top:1px solid var(--border-color); padding-top:1rem;">
                    <strong>Overall Progress: ${completedTasks}/${totalTasks} tasks (${totalPercent}%)</strong>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width:${totalPercent}%;"></div>
                    </div>
                    <p style="margin-top:0.5rem; font-size:0.9rem; color:var(--text-light);">
                        Status: <strong>${ue.status === 'completed' ? '✓ Completed' : '⏳ In Progress'}</strong>
                    </p>
                </div>
            `;

            // Wrong QR alert
            if (ue.wrong_qr_scans?.length > 0) {
                progressHTML += `
                    <div style="margin-top:1rem; padding:0.75rem; background:#fee2e2; border-radius:4px; border-left:4px solid var(--danger-color);">
                        <strong style="color:#991b1b;">⚠️ Alert:</strong>
                        <p style="font-size:0.9rem; margin-top:0.25rem;">
                            ${ue.wrong_qr_scans.length} incorrect QR scan attempt(s). Complete tasks in order!
                        </p>
                    </div>
                `;
            }

            eventProgress.innerHTML = progressHTML;
            progressContainer.appendChild(eventProgress);
        }

    } catch (error) {
        console.error('Load progress error:', error);
        progressContainer.innerHTML = `<p>Error loading progress: ${error.message}</p>`;
    }
}

async function loadProfile() {
    try {
        const response = await api.getUser();
        if (!response.success) throw new Error(response.message);

        const user = response.data;
        document.getElementById('profileName').value = user.name;
        document.getElementById('profileEmail').value = user.email;
        document.getElementById('profilePhone').value = user.phone;
    } catch (error) {
        console.error('Load profile error:', error);
    }
}

async function handleProfileUpdate(event) {
    event.preventDefault();

    try {
        const name = document.getElementById('profileName').value;
        const phone = document.getElementById('profilePhone').value;

        const response = await api.request('auth.php?action=update-profile', 'POST', { name, phone });
        if (!response.success) throw new Error(response.message);

        alert('Profile updated successfully');
        document.getElementById('userName').textContent = name;
    } catch (error) {
        console.error('Profile update error:', error);
        alert('Failed to update profile: ' + error.message);
    }
}
