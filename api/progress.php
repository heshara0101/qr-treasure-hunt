<?php
/**
 * Progress API
 * Track user progress through events
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

$input = json_decode(file_get_contents('php://input'), true);

switch ($action) {
    case 'join-event':
        handleJoinEvent($input);
        break;
    case 'get-progress':
        handleGetProgress();
        break;
    case 'get-my-events':
        handleGetMyEvents();
        break;
    case 'submit-answer':
        handleSubmitAnswer($input);
        break;
    case 'scan-qr':
        handleScanQR();
        break;
    case 'get-results':
        handleGetResults();
        break;
    default:
        jsonResponse(false, 'Action not found', null, 404);
}

function handleJoinEvent($input) {
    global $db;
    
    $user = getAuthUser();
    if (!$user) {
        jsonResponse(false, 'Unauthorized', null, 401);
    }
    
    $event_id = $input['event_id'] ?? null;
    if (!$event_id) {
        jsonResponse(false, 'Event ID required', null, 400);
    }
    
    // Check if user already joined
    $stmt = $db->prepare("SELECT id FROM user_events WHERE user_id = ? AND event_id = ?");
    $stmt->bind_param("ii", $user['id'], $event_id);
    $stmt->execute();
    
    if ($stmt->get_result()->num_rows > 0) {
        jsonResponse(false, 'Already joined this event', null, 400);
    }
    
    // Add user to event
    $stmt = $db->prepare("INSERT INTO user_events (user_id, event_id) VALUES (?, ?)");
    $stmt->bind_param("ii", $user['id'], $event_id);
    
    if ($stmt->execute()) {
        // Initialize progress
        $stmt = $db->prepare("INSERT INTO progress (user_id, event_id, current_level, total_tasks) VALUES (?, ?, 1, 0)");
        $stmt->bind_param("ii", $user['id'], $event_id);
        $stmt->execute();
        
        jsonResponse(true, 'Joined event successfully');
    } else {
        jsonResponse(false, 'Failed to join event', null, 500);
    }
}
function handleGetMyEvents() {
    global $db;

    $user = getAuthUser();
    if (!$user) {
        jsonResponse(false, 'Unauthorized', null, 401);
    }

    // Get events the user joined
    $stmt = $db->prepare("
        SELECT e.*
        FROM user_events ue
        JOIN events e ON ue.event_id = e.id
        WHERE ue.user_id = ?
        ORDER BY e.created_at DESC
    ");
    $stmt->bind_param("i", $user['id']);
    $stmt->execute();
    $result = $stmt->get_result();

    $events = [];
    while ($row = $result->fetch_assoc()) {
        $events[] = $row;
    }

    jsonResponse(true, 'My events loaded', $events);
}

function handleGetProgress() {
    global $db;

    $user = getAuthUser();
    if (!$user) {
        jsonResponse(false, 'Unauthorized', null, 401);
    }

    // Get all progress related to the current user
    $stmt = $db->prepare("
        SELECT * FROM progress 
        WHERE user_id = ?
        ORDER BY updated_at DESC
    ");
    $stmt->bind_param("i", $user['id']);
    $stmt->execute();

    $result = $stmt->get_result();

    $progressList = [];

    while ($row = $result->fetch_assoc()) {
        $progressList[] = $row;
    }

    if (empty($progressList)) {
        jsonResponse(false, 'No progress data found', []);
    }

    jsonResponse(true, 'Progress list retrieved', $progressList);
}

function handleSubmitAnswer($input) {
    global $db;
    
    $user = getAuthUser();
    if (!$user) {
        jsonResponse(false, 'Unauthorized', null, 401);
    }
    
    $task_id = $input['task_id'] ?? null;
    $user_answer = $input['answer'] ?? null;
    $level_id = $input['level_id'] ?? null;
    $event_id = $input['event_id'] ?? null;
    
    if (!$task_id || !$user_answer || !$level_id || !$event_id) {
        jsonResponse(false, 'Missing required fields', null, 400);
    }
    
    // Get task
    $stmt = $db->prepare("SELECT correct_answer FROM tasks WHERE id = ?");
    $stmt->bind_param("i", $task_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        jsonResponse(false, 'Task not found', null, 404);
    }
    
    $task = $result->fetch_assoc();
    $is_correct = ($user_answer === $task['correct_answer']) ? 1 : 0;
    
    // Record answer
    $stmt = $db->prepare("INSERT INTO completed_tasks (user_id, task_id, level_id, user_answer, is_correct) 
                          VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("iiisi", $user['id'], $task_id, $level_id, $user_answer, $is_correct); // Fixed bind_param here
    
    if ($stmt->execute()) {
        // Update progress
        updateUserProgress($user['id'], $event_id);
        
        jsonResponse(true, 'Answer submitted', ['correct' => (bool)$is_correct]);
    } else {
        jsonResponse(false, 'Failed to submit answer', null, 500);
    }
}

function handleScanQR() {
    global $db;

    // 🔐 If scanning should be allowed only for logged-in users, keep this.
    // If it causes "Unauthorized", comment this whole block out.
    $user = getAuthUser();
    if (!$user) {
        jsonResponse(false, 'Unauthorized', null, 401);
    }

    // Get ?qr=... from the query string
    $qr_value = $_GET['qr'] ?? null;
    if (!$qr_value) {
        jsonResponse(false, 'QR value required', null, 400);
    }

    // Look up the full task by qr_code_value
    $stmt = $db->prepare("
        SELECT 
            id,
            level_id, 
            task_number,
            type,
            question,
            options,
            correct_answer,
            qr_code_value
        FROM tasks
        WHERE qr_code_value = ?
        LIMIT 1
    ");
    $stmt->bind_param("s", $qr_value);
    $stmt->execute();
    $result = $stmt->get_result();

    if (!$result || $result->num_rows === 0) {
        jsonResponse(false, 'Invalid QR code', null, 404);
    }

    $task = $result->fetch_assoc();

    // If options are stored as JSON, decode them
    $task['options'] = $task['options']
        ? json_decode($task['options'], true)
        : [];

    // Return ALL task columns
    jsonResponse(true, 'QR code scanned', $task);
}
function handleGetResults() {
    global $db;
    
    $user = getAuthUser();
    if (!$user) {
        jsonResponse(false, 'Unauthorized', null, 401);
    }
    
    $event_id = $_GET['event_id'] ?? null;
    if (!$event_id) {
        jsonResponse(false, 'Event ID required', null, 400);
    }
    
    // Get completed tasks
    $stmt = $db->prepare("SELECT ct.*, t.question FROM completed_tasks ct 
                          JOIN tasks t ON ct.task_id = t.id
                          WHERE ct.user_id = ? AND ct.level_id IN (
                            SELECT id FROM levels WHERE event_id = ? 
                          )
                          ORDER BY ct.completed_at");
    $stmt->bind_param("ii", $user['id'], $event_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $results = [];
    $correct = 0;
    $total = 0;
    
    while ($row = $result->fetch_assoc()) {
        $results[] = $row;
        $total++;
        if ($row['is_correct']) {
            $correct++;
        }
    }
    
    $percentage = $total > 0 ? round(($correct / $total) * 100) : 0;
    
    jsonResponse(true, 'Results retrieved', [
        'results' => $results,
        'correct' => $correct,
        'total' => $total,
        'percentage' => $percentage
    ]);
}

function updateUserProgress($user_id, $event_id) {
    global $db;
    
    // Count completed correct tasks
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM completed_tasks ct
                          JOIN tasks t ON ct.task_id = t.id
                          JOIN levels l ON t.level_id = l.id
                          WHERE ct.user_id = ? AND l.event_id = ? AND ct.is_correct = 1");
    $stmt->bind_param("ii", $user_id, $event_id);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    $tasks_completed = $result['count'];
    
    // Count total tasks
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM tasks t
                          JOIN levels l ON t.level_id = l.id
                          WHERE l.event_id = ?");
    $stmt->bind_param("i", $event_id);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    $total_tasks = $result['count'];
    
    $percentage = $total_tasks > 0 ? round(($tasks_completed / $total_tasks) * 100) : 0;
    
    $stmt = $db->prepare("UPDATE progress SET tasks_completed = ?, total_tasks = ?, progress_percentage = ? 
                          WHERE user_id = ? AND event_id = ?");
    $stmt->bind_param("iiiii", $tasks_completed, $total_tasks, $percentage, $user_id, $event_id);
    $stmt->execute();
}

?>
