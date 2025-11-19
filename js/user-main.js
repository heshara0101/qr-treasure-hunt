// User Dashboard Main Functions

window.addEventListener('DOMContentLoaded', () => {
    if (!AuthManager.isLoggedIn() || AuthManager.isAdmin()) {
        window.location.href = '../login.html';
    }

    const user = AuthManager.getCurrentUser();
    document.getElementById('userName').textContent = user.fullname || 'User';

    // Load initial data
    loadMyEvents();
    loadProgress();
    loadProfile();
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
