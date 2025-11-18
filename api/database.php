<?php
/**
 * Database Connection
 */

require_once __DIR__ . '/config.php';

class Database {
    private $conn;
    
    public function __construct() {
        try {
            $this->conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
            
            if ($this->conn->connect_error) {
                throw new Exception("Connection failed: " . $this->conn->connect_error);
            }
            
            $this->conn->set_charset("utf8");
        } catch (Exception $e) {
            jsonResponse(false, "Database connection error: " . $e->getMessage(), null, 500);
        }
    }
    
    public function getConnection() {
        return $this->conn;
    }
    
    public function query($sql) {
        $result = $this->conn->query($sql);
        if (!$result) {
            throw new Exception("Query error: " . $this->conn->error);
        }
        return $result;
    }
    
    public function prepare($sql) {
        return $this->conn->prepare($sql);
    }
    
    public function escapeString($string) {
        return $this->conn->real_escape_string($string);
    }
    
    public function insertId() {
        return $this->conn->insert_id;
    }
    
    public function affectedRows() {
        return $this->conn->affected_rows;
    }
    
    public function close() {
        $this->conn->close();
    }
}

// Initialize database connection
$db = new Database();

?>
