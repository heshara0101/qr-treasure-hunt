// User Dashboard Main Functions

window.addEventListener('DOMContentLoaded', async () => {
    if (!AuthManager.isLoggedIn() || AuthManager.isAdmin()) {
        window.location.href = '../login.html';
        return;
    }

    try {
        // Wait for the API call
        const userResp = await api.getUser();
        if (!userResp.success) throw new Error(userResp.message);

        const user = userResp.data;
        document.getElementById('userName').textContent = user.email || 'User';

        // Load initial data
        loadMyEvents();
        loadProgress();
        loadProfile();
    } catch (error) {
        console.error('Failed to load user:', error);
        document.getElementById('userName').textContent = 'User';
    }
});


function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });

    document.getElementById(sectionId).classList.add('active');
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
}
