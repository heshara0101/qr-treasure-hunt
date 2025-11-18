<?php
/**
 * Events API
 * Create, Read, Update, Delete Events
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

$input = json_decode(file_get_contents('php://input'), true);

switch ($action) {
    case 'create':
        handleCreateEvent($input);
        break;
    case 'list':
        handleListEvents();
        break;
    case 'get':
        handleGetEvent();
        break;
    case 'update':
        handleUpdateEvent($input);
        break;
    case 'delete':
        handleDeleteEvent();
        break;
    case 'add-level':
        handleAddLevel($input);
        break;
    case 'add-task':
        handleAddTask($input);
        break;
    default:
        jsonResponse(false, 'Action not found', null, 404);
}

function handleCreateEvent($input) {
    global $db;
    
    $user = getAuthUser();
    if (!$user || $user['role'] !== 'admin') {
        jsonResponse(false, 'Unauthorized - Admin only', null, 403);
    }
    
    $title = $input['title'] ?? null;
    $description = $input['description'] ?? null;
    
    if (!$title) {
        jsonResponse(false, 'Title is required', null, 400);
    }
    
    $admin_id = $user['id'];
    $stmt = $db->prepare("INSERT INTO events (admin_id, title, description) VALUES (?, ?, ?)");
    $stmt->bind_param("iss", $admin_id, $title, $description);
    
    if ($stmt->execute()) {
        $event_id = $db->insertId();
        jsonResponse(true, 'Event created', ['id' => $event_id, 'title' => $title]);
    } else {
        jsonResponse(false, 'Failed to create event', null, 500);
    }
}

function handleListEvents() {
    global $db;
    
    $user = getAuthUser();
    if (!$user) {
        jsonResponse(false, 'Unauthorized', null, 401);
    }
    
    if ($user['role'] === 'admin') {
        // Admin sees their events
        $stmt = $db->prepare("SELECT * FROM events WHERE admin_id = ? ORDER BY created_at DESC");
        $stmt->bind_param("i", $user['id']);
    } else {
        // Users see joined events
        $stmt = $db->prepare("
            SELECT e.* FROM events e
            INNER JOIN user_events ue ON e.id = ue.event_id
            WHERE ue.user_id = ?
            ORDER BY e.created_at DESC
        ");
        $stmt->bind_param("i", $user['id']);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    $events = [];
    
    while ($row = $result->fetch_assoc()) {
        $events[] = $row;
    }
    
    jsonResponse(true, 'Events retrieved', $events);
}

function handleGetEvent()
{
    global $db;

    $user = getAuthUser();
    if (!$user) {
        jsonResponse(false, 'Unauthorized', null, 401);
    }

    // Get and validate event_id
    if (!isset($_GET['id'])) {
        jsonResponse(false, 'Event ID required', null, 400);
    }

    // Force event_id to integer
    $event_id = (int)$_GET['id'];
    if ($event_id <= 0) {
        jsonResponse(false, 'Valid Event ID required', null, 400);
    }

    // ---------- GET EVENT ----------
    $stmt = $db->prepare("SELECT * FROM events WHERE id = ?");
    if (!$stmt) {
        jsonResponse(false, 'DB error (prepare event): ' . $db->error, null, 500);
    }

    $stmt->bind_param("i", $event_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if (!$result) {
        jsonResponse(false, 'DB error (execute event): ' . $stmt->error, null, 500);
    }

    if ($result->num_rows === 0) {
        jsonResponse(false, 'Event not found', null, 404);
    }

    $event = $result->fetch_assoc();
    $stmt->close();

    // ---------- GET LEVELS ----------
    $stmt = $db->prepare("SELECT * FROM levels WHERE event_id = ? ORDER BY level_number");
    if (!$stmt) {
        jsonResponse(false, 'DB error (prepare levels): ' . $db->error, null, 500);
    }

    $stmt->bind_param("i", $event_id);
    $stmt->execute();
    $levelsResult = $stmt->get_result();

    if (!$levelsResult) {
        jsonResponse(false, 'DB error (execute levels): ' . $stmt->error, null, 500);
    }

    $levels = [];
    while ($level = $levelsResult->fetch_assoc()) {

        // ---------- GET TASKS FOR THIS LEVEL ----------
        $taskStmt = $db->prepare("SELECT * FROM tasks WHERE level_id = ? ORDER BY task_number");
        if (!$taskStmt) {
            jsonResponse(false, 'DB error (prepare tasks): ' . $db->error, null, 500);
        }

        $level_id = (int)$level['id'];
        $taskStmt->bind_param("i", $level_id);
        $taskStmt->execute();
        $tasksResult = $taskStmt->get_result();

        if (!$tasksResult) {
            jsonResponse(false, 'DB error (execute tasks): ' . $taskStmt->error, null, 500);
        }

        $tasks = [];
        while ($task = $tasksResult->fetch_assoc()) {
            // Decode JSON options if not null/empty
            if (!empty($task['options'])) {
                $task['options'] = json_decode($task['options'], true);
            } else {
                $task['options'] = [];
            }
            $tasks[] = $task;
        }

        $taskStmt->close();

        $level['tasks'] = $tasks;
        $levels[] = $level;
    }

    $stmt->close();

    $event['levels'] = $levels;

    jsonResponse(true, 'Event retrieved', $event, 200);
}

// ============================
// ROUTER
// ============================

$action = $_GET['action'] ?? null;

switch ($action) {
    case 'get':
        handleGetEvent();
        break;

    default:
        jsonResponse(false, 'Unknown or missing action', null, 400);
}

function handleUpdateEvent($input) {
    global $db;
    
    $user = getAuthUser();
    if (!$user || $user['role'] !== 'admin') {
        jsonResponse(false, 'Unauthorized', null, 403);
    }
    
    $event_id = $input['id'] ?? null;
    $title = $input['title'] ?? null;
    $description = $input['description'] ?? null;
    
    if (!$event_id) {
        jsonResponse(false, 'Event ID required', null, 400);
    }
    
    $stmt = $db->prepare("UPDATE events SET title = ?, description = ? WHERE id = ? AND admin_id = ?");
    $stmt->bind_param("ssii", $title, $description, $event_id, $user['id']);
    
    if ($stmt->execute()) {
        jsonResponse(true, 'Event updated');
    } else {
        jsonResponse(false, 'Failed to update event', null, 500);
    }
}

function handleDeleteEvent() {
    global $db;
    
    $user = getAuthUser();
    if (!$user || $user['role'] !== 'admin') {
        jsonResponse(false, 'Unauthorized', null, 403);
    }
    
    $event_id = $_GET['id'] ?? null;
    if (!$event_id) {
        jsonResponse(false, 'Event ID required', null, 400);
    }
    
    $stmt = $db->prepare("DELETE FROM events WHERE id = ? AND admin_id = ?");
    $stmt->bind_param("ii", $event_id, $user['id']);
    
    if ($stmt->execute()) {
        jsonResponse(true, 'Event deleted');
    } else {
        jsonResponse(false, 'Failed to delete event', null, 500);
    }
}

function handleAddLevel($input) {
    global $db;
    
    $user = getAuthUser();
    if (!$user || $user['role'] !== 'admin') {
        jsonResponse(false, 'Unauthorized', null, 403);
    }
    
    $event_id = $input['event_id'] ?? null;
    $level_number = $input['level_number'] ?? null;
    $title = $input['title'] ?? null;
    $description = $input['description'] ?? null;
    
    if (!$event_id || !$level_number || !$title) {
        jsonResponse(false, 'Missing required fields', null, 400);
    }
    
    $stmt = $db->prepare("INSERT INTO levels (event_id, level_number, title, description) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("iiss", $event_id, $level_number, $title, $description);
    
    if ($stmt->execute()) {
        $level_id = $db->insertId();
        jsonResponse(true, 'Level added', ['id' => $level_id]);
    } else {
        jsonResponse(false, 'Failed to add level', null, 500);
    }
}

function handleAddTask($input) {
    global $db;
    
    $user = getAuthUser();
    if (!$user || $user['role'] !== 'admin') {
        jsonResponse(false, 'Unauthorized', null, 403);
    }
    
    $level_id = $input['level_id'] ?? null;
    $task_number = $input['task_number'] ?? null;
    $type = $input['type'] ?? 'mcq';
    $question = $input['question'] ?? null;
    $options = $input['options'] ?? [];
    $correct_answer = $input['correct_answer'] ?? null;

    // qr_value comes from user input
    $qr_value = $input['qr_value'] ?? null;
    
    if (!$level_id || !$task_number || !$question || !$qr_value) {
        jsonResponse(false, 'Missing required fields', null, 400);
    }
    
    $options_json = json_encode($options);
    
    $stmt = $db->prepare("INSERT INTO tasks (level_id, task_number, type, question, options, correct_answer, qr_code_value) 
                          VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("iisssss", $level_id, $task_number, $type, $question, $options_json, $correct_answer, $qr_value);
    
    if ($stmt->execute()) {
        $task_id = $db->insertId();
        
        // Generate QR code URL using third-party API with the user-provided qr_value
        $qr_url = QR_API_URL . '?size=300x300&data=' . urlencode($qr_value);
        
        jsonResponse(true, 'Task added', [
            'id' => $task_id,
            'qr_code_url' => $qr_url,
            'qr_value' => $qr_value
        ]);
    } else {
        jsonResponse(false, 'Failed to add task', null, 500);
    }
}


?>
