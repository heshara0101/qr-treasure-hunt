<?php
/**
 * Authentication API
 * Login, Register, Logout
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

$input = json_decode(file_get_contents('php://input'), true);

switch ($action) {
    case 'register':
        handleRegister($input);
        break;
    case 'login':
        handleLogin($input);
        break;
    case 'get-user':
        handleGetUser();
        break;
    case 'logout':
        handleLogout();
        break;
    default:
        jsonResponse(false, 'Action not found', null, 404);
}

function handleRegister($input) {
    global $db;
    
    $email = $input['email'] ?? null;
    $password = $input['password'] ?? null;
    $name = $input['name'] ?? null;
    $phone = $input['phone'] ?? null;
    
    if (!$email || !$password || !$name) {
        jsonResponse(false, 'Missing required fields', null, 400);
    }
    
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    
    if ($stmt->get_result()->num_rows > 0) {
        jsonResponse(false, 'Email already exists', null, 400);
    }
    
    $hashedPassword = hashPassword($password);
    $phone = $phone ?? '0000000000';
    
    $stmt = $db->prepare("INSERT INTO users (email, password, name, phone, role) VALUES (?, ?, ?, ?, ?)");
    $role = 'user';
    $stmt->bind_param("sssss", $email, $hashedPassword, $name, $phone, $role);
    
    if ($stmt->execute()) {
        $userId = $db->insertId();
        $token = generateJWT(['id' => $userId, 'email' => $email, 'role' => $role]);
        
        jsonResponse(true, 'Registration successful', [
            'id' => $userId,
            'email' => $email,
            'name' => $name,
            'role' => $role,
            'token' => $token
        ]);
    } else {
        jsonResponse(false, 'Registration failed', null, 500);
    }
}

function handleLogin($input) {
    global $db;
    
    $email = $input['email'] ?? null;
    $password = $input['password'] ?? null;
    
    if (!$email || !$password) {
        jsonResponse(false, 'Email and password required', null, 400);
    }
    
    $stmt = $db->prepare("SELECT id, password, name, role FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        jsonResponse(false, 'Invalid credentials', null, 401);
    }
    
    $user = $result->fetch_assoc();
    
    if (!verifyPassword($password, $user['password'])) {
        jsonResponse(false, 'Invalid credentials', null, 401);
    }
    
    $token = generateJWT([
        'id' => $user['id'],
        'email' => $email,
        'role' => $user['role']
    ]);
    
    jsonResponse(true, 'Login successful', [
        'id' => $user['id'],
        'email' => $email,
        'name' => $user['name'],
        'role' => $user['role'],
        'token' => $token
    ]);
}

function handleGetUser() {
    $user = getAuthUser();
    
    if (!$user) {
        jsonResponse(false, 'Unauthorized', null, 401);
    }
    
    jsonResponse(true, 'User retrieved', $user);
}

function handleLogout() {
    jsonResponse(true, 'Logged out successfully');
}

?>
