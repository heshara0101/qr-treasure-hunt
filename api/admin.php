<?php
/**
 * Admin API
 * Admin-only operations
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

$input = json_decode(file_get_contents('php://input'), true);

switch ($action) {
    case 'get-event-results':
        handleGetEventResults();
        break;
    case 'get-all-users':
        handleGetAllUsers();
        break;
    case 'get-user-detail':
        handleGetUserDetail();
        break;
    case 'get-event-stats':
        handleGetEventStats();
        break;
    default:
        jsonResponse(false, 'Action not found', null, 404);
}

function handleGetEventResults() {
    global $db;
    
    $user = getAuthUser();
    if (!$user || $user['role'] !== 'admin') {
        jsonResponse(false, 'Unauthorized', null, 403);
    }
    
    $event_id = $_GET['event_id'] ?? null;
    if (!$event_id) {
        jsonResponse(false, 'Event ID required', null, 400);
    }
    
    // Get all users in event with their progress
    $stmt = $db->prepare("SELECT u.id, u.name, u.email, p.tasks_completed, p.total_tasks, p.progress_percentage
                          FROM user_events ue
                          JOIN users u ON ue.user_id = u.id
                          LEFT JOIN progress p ON ue.user_id = p.user_id AND ue.event_id = p.event_id
                          WHERE ue.event_id = ?
                          ORDER BY p.progress_percentage DESC");
    $stmt->bind_param("i", $event_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $results = [];
    while ($row = $result->fetch_assoc()) {
        $results[] = $row;
    }
    
    jsonResponse(true, 'Event results retrieved', $results);
}

function handleGetAllUsers() {
    global $db;
    
    $user = getAuthUser();
    if (!$user || $user['role'] !== 'admin') {
        jsonResponse(false, 'Unauthorized', null, 403);
    }
    
    $stmt = $db->prepare("SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC");
    $stmt->execute();
    $result = $stmt->get_result();
    
    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
    
    jsonResponse(true, 'Users retrieved', $users);
}

function handleGetUserDetail() {
    global $db;
    
    $user = getAuthUser();
    if (!$user || $user['role'] !== 'admin') {
        jsonResponse(false, 'Unauthorized', null, 403);
    }
    
    $user_id = $_GET['user_id'] ?? null;
    if (!$user_id) {
        jsonResponse(false, 'User ID required', null, 400);
    }
    
    // Get user
    $stmt = $db->prepare("SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        jsonResponse(false, 'User not found', null, 404);
    }
    
    $userData = $result->fetch_assoc();
    
    // Get user's event progress
    $stmt = $db->prepare("SELECT e.id, e.title, p.progress_percentage FROM user_events ue
                          JOIN events e ON ue.event_id = e.id
                          LEFT JOIN progress p ON ue.user_id = p.user_id AND ue.event_id = p.event_id
                          WHERE ue.user_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $eventsResult = $stmt->get_result();
    
    $events = [];
    while ($row = $eventsResult->fetch_assoc()) {
        $events[] = $row;
    }
    
    $userData['events'] = $events;
    jsonResponse(true, 'User detail retrieved', $userData);
}

function handleGetEventStats() {
    global $db;
    
    $user = getAuthUser();
    if (!$user || $user['role'] !== 'admin') {
        jsonResponse(false, 'Unauthorized', null, 403);
    }
    
    $event_id = $_GET['event_id'] ?? null;
    if (!$event_id) {
        jsonResponse(false, 'Event ID required', null, 400);
    }
    
    // Total users
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM user_events WHERE event_id = ?");
    $stmt->bind_param("i", $event_id);
    $stmt->execute();
    $totalUsers = $stmt->get_result()->fetch_assoc()['count'];
    
    // Users completed
    $stmt = $db->prepare("SELECT COUNT(DISTINCT user_id) as count FROM progress 
                          WHERE event_id = ? AND progress_percentage = 100");
    $stmt->bind_param("i", $event_id);
    $stmt->execute();
    $completedUsers = $stmt->get_result()->fetch_assoc()['count'];
    
    // Average progress
    $stmt = $db->prepare("SELECT AVG(progress_percentage) as avg FROM progress WHERE event_id = ?");
    $stmt->bind_param("i", $event_id);
    $stmt->execute();
    $avgProgress = round($stmt->get_result()->fetch_assoc()['avg'] ?? 0);
    
    // Total levels and tasks
    $stmt = $db->prepare("SELECT COUNT(DISTINCT id) as count FROM levels WHERE event_id = ?");
    $stmt->bind_param("i", $event_id);
    $stmt->execute();
    $totalLevels = $stmt->get_result()->fetch_assoc()['count'];
    
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM tasks WHERE level_id IN (
                          SELECT id FROM levels WHERE event_id = ?)");
    $stmt->bind_param("i", $event_id);
    $stmt->execute();
    $totalTasks = $stmt->get_result()->fetch_assoc()['count'];
    
    jsonResponse(true, 'Event stats retrieved', [
        'total_users' => $totalUsers,
        'completed_users' => $completedUsers,
        'average_progress' => $avgProgress,
        'total_levels' => $totalLevels,
        'total_tasks' => $totalTasks
    ]);
}

?>
