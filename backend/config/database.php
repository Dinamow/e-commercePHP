<?php
$host   = getenv('DB_HOST') ?: 'localhost';
$dbname = getenv('DB_NAME') ?: 'ecommerce';
$user   = getenv('DB_USER') ?: 'root';
$pass   = getenv('DB_PASS') ?: '';

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}
$conn->set_charset('utf8mb4');
