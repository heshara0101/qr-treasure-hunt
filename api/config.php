<?php
/**
 * Configuration File
 * Simple Lightweight PHP Backend
 */

// Database Configuration
define('DB_HOST', 'localhost');      // Your database host
define('DB_USER', 'root');           // Your database username
define('DB_PASS', '');               // Your database password
define('DB_NAME', 'qr_treasure');    // Your database name

// API Configuration
define('API_URL', 'http://localhost/qr-treasure-hunt/api');
define('FRONTEND_URL', 'http://localhost/qr-treasure-hunt');

// Security Configuration
define('JWT_SECRET', 'your_super_secret_key_change_this_in_production');
define('JWT_EXPIRY', 7 * 24 * 60 * 60); // 7 days

// QR Code API (Third-party - Free)
define('QR_API_URL', 'https://api.qrserver.com/v1/create-qr-code/');

// Response Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Simple JWT Functions
function generateJWT($data) {
    $header = json_encode(['alg' => 'HS256', 'typ' => 'JWT']);
    $payload = json_encode(array_merge($data, ['exp' => time() + JWT_EXPIRY]));
    
    $base64UrlHeader = strtr(base64_encode($header), '+/', '-_');
    $base64UrlPayload = strtr(base64_encode($payload), '+/', '-_');
    
    $signature = hash_hmac('sha256', $base64UrlHeader . '.' . $base64UrlPayload, JWT_SECRET, true);
    $base64UrlSignature = strtr(base64_encode($signature), '+/', '-_');
    
    return $base64UrlHeader . '.' . $base64UrlPayload . '.' . $base64UrlSignature;
}

function verifyJWT($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    
    $signature = hash_hmac('sha256', $parts[0] . '.' . $parts[1], JWT_SECRET, true);
    $validSignature = strtr(base64_encode($signature), '+/', '-_');
    
    if ($parts[2] !== $validSignature) return null;
    
    $payload = json_decode(base64_decode(strtr($parts[1], '-_', '+/')), true);
    if ($payload['exp'] < time()) return null;
    
    return $payload;
}

function getAuthUser() {
    $headers = getallheaders();
    if (!isset($headers['Authorization'])) return null;
    
    $authHeader = $headers['Authorization'];
    if (strpos($authHeader, 'Bearer ') === false) return null;
    
    $token = str_replace('Bearer ', '', $authHeader);
    return verifyJWT($token);
}

// JSON Response Helper
function jsonResponse($success, $message, $data = null, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

// Hash Password
function hashPassword($password) {
    return password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);
}

// Verify Password
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

?>
