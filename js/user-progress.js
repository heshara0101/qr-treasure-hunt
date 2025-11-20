// user-progress.js
// User Progress & Profile Management using APIClient

async function loadProgress() {
    const progressContainer = document.getElementById('progressContainer');
    progressContainer.innerHTML = '<p>Loading progress...</p>';

    try {
        // 1️⃣ Get current user
        const userResp = await api.getUser();
        if (!userResp.success) throw new Error(userResp.message);

        // 2️⃣ Get user progress
        const joinedEventsResp = await api.getProgress();
        if (!joinedEventsResp.success) throw new Error(joinedEventsResp.message);

        const userEvents = joinedEventsResp.data || [];

        if (userEvents.length === 0) {
            progressContainer.innerHTML = '<p>Join an event to see your progress</p>';
            return;
        }

        progressContainer.innerHTML = '';

        // 3️⃣ Loop through each event and show task-box style progress
        for (const ue of userEvents) {
            const eventResp = await api.getEvent(ue.event_id);
            if (!eventResp.success || !eventResp.data) continue;

            const event = eventResp.data;

            const totalTasks = ue.total_tasks || 0;
            const completedTasks = ue.tasks_completed || 0;
            const percent = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

            const eventProgress = document.createElement('div');
            eventProgress.className = 'event-progress';
            eventProgress.style.border = '1px solid #ccc';
            eventProgress.style.padding = '1rem';
            eventProgress.style.marginBottom = '1rem';
            eventProgress.style.borderRadius = '6px';
            eventProgress.style.background = '#fafafa';

            let tasksHTML = '';
            for (let i = 1; i <= totalTasks; i++) {
                let statusClass = 'not-started';
                if (i <= completedTasks) statusClass = 'completed';
                else if (i === completedTasks + 1) statusClass = 'current';

                let color = '#e0e0e0'; // not-started
                if (statusClass === 'completed') color = '#4caf50'; // green
                else if (statusClass === 'current') color = '#ff9800'; // orange

                tasksHTML += `<div class="task-box" title="Task ${i}" style="
                    display:inline-block;
                    width:30px;
                    height:30px;
                    line-height:30px;
                    margin:2px;
                    text-align:center;
                    border-radius:4px;
                    color:white;
                    font-weight:bold;
                    background:${color};
                ">
                    ${statusClass === 'completed' ? '✓' : i}
                </div>`;
            }

            eventProgress.innerHTML = `
                <h3>${event.title}</h3>
                <div class="tasks-container">${tasksHTML}</div>
                <p style="margin-top:0.5rem;">Progress: ${completedTasks} / ${totalTasks} tasks (${percent}%)</p>
                <div class="progress-bar" style="background:#eee; border-radius:4px; height:12px; overflow:hidden;">
                    <div class="progress-fill" style="width:${percent}%; background:#4caf50; height:100%;"></div>
                </div>
            `;

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

        const response = await api.updateProfile(name, phone);
        if (!response.success) throw new Error(response.message);

        alert('Profile updated successfully');
        document.getElementById('userName').textContent = name;
    } catch (error) {
        console.error('Profile update error:', error);
        alert('Failed to update profile: ' + error.message);
    }
}
