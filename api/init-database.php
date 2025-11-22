<?php
/**
 * Database Initialization
 * Run this once to create all tables
 */

require_once __DIR__ . '/config.php';

class DatabaseInit {
    private $conn;
    
    public function __construct() {
        $this->conn = new mysqli(DB_HOST, DB_USER, DB_PASS);
        
        if ($this->conn->connect_error) {
            die("Connection failed: " . $this->conn->connect_error);
        }
    }
    
    public function init() {
        echo "Creating database...\n";
        
        // Create database
        $sql = "CREATE DATABASE IF NOT EXISTS " . DB_NAME;
        if ($this->conn->query($sql)) {
            echo "✓ Database created/exists\n";
        } else {
            echo "✗ Error creating database: " . $this->conn->error . "\n";
            return false;
        }
        
        // Select database
        $this->conn->select_db(DB_NAME);
        
        // Create tables
        $tables = $this->getTables();
        
        foreach ($tables as $tableName => $sql) {
            echo "Creating table: $tableName... ";
            if ($this->conn->query($sql)) {
                echo "✓\n";
            } else {
                echo "✗ " . $this->conn->error . "\n";
            }
        }
        
        // Insert default admin
        echo "Creating default admin... ";
        $email = 'admin@example.com';
        $password = hashPassword('admin123');
        
        $sql = "INSERT INTO users (email, password, name, phone, role, created_at) 
                VALUES ('$email', '$password', 'Admin', '0000000000', 'admin', NOW())";
        
        if ($this->conn->query($sql)) {
            echo "✓\n";
        } else {
            echo "✓ (Already exists)\n";
        }
        
        echo "\n✅ Database initialized successfully!\n";
        echo "Default Admin Login:\n";
        echo "  Email: admin@example.com\n";
        echo "  Password: admin123\n";
    }
    
    private function getTables() {
        return [
            'users' => "
                CREATE TABLE IF NOT EXISTS users (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    phone VARCHAR(20),
                    role ENUM('admin', 'user') DEFAULT 'user',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            ",
            
            'events' => "
                CREATE TABLE IF NOT EXISTS events (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    admin_id INT NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    status ENUM('active', 'inactive', 'completed') DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
                )
            ",
            
            'levels' => "
                CREATE TABLE IF NOT EXISTS levels (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    event_id INT NOT NULL,
                    level_number INT NOT NULL,
                    title VARCHAR(255),
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
                    UNIQUE KEY unique_level (event_id, level_number)
                )
            ",
            
            'tasks' => "
                CREATE TABLE IF NOT EXISTS tasks (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    level_id INT NOT NULL,
                    task_number INT NOT NULL,
                    type ENUM('mcq', 'text', 'image') DEFAULT 'mcq',
                    question VARCHAR(500) NOT NULL,
                    options JSON,
                    correct_answer VARCHAR(500),
                    qr_code_value VARCHAR(500),
                    qr_location VARCHAR(500),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE
                )
            ",
            
            'user_events' => "
                CREATE TABLE IF NOT EXISTS user_events (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    user_id INT NOT NULL,
                    event_id INT NOT NULL,
                    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    status ENUM('active', 'completed') DEFAULT 'active',
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
                    UNIQUE KEY unique_user_event (user_id, event_id)
                )
            ",
            
            'completed_tasks' => "
                CREATE TABLE IF NOT EXISTS completed_tasks (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    user_id INT NOT NULL,
                    task_id INT NOT NULL,
                    level_id INT NOT NULL,
                    user_answer VARCHAR(500),
                    is_correct BOOLEAN DEFAULT FALSE,
                    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
                    FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE
                )
            ",
            
            'progress' => "
                CREATE TABLE IF NOT EXISTS progress (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    user_id INT NOT NULL,
                    event_id INT NOT NULL,
                    current_level INT DEFAULT 1,
                    tasks_completed INT DEFAULT 0,
                    total_tasks INT DEFAULT 0,
                    progress_percentage INT DEFAULT 0,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
                    UNIQUE KEY unique_progress (user_id, event_id)
                )
            "
        ];
    }
}

// Helper function (needed for init)

if (!function_exists('hashPassword')) {
    function hashPassword($password) {
        // your hashing logic
        // e.g. return password_hash($password, PASSWORD_DEFAULT);
    }
}
//php backend/api/init-database.php


// Run initialization
$init = new DatabaseInit();
$init->init();

?>
