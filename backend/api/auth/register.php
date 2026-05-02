<?php
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/auth.php';
require_once __DIR__ . '/../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

$data = json_decode(file_get_contents('php://input'), true);

$name     = trim($data['name'] ?? '');
$email    = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (!$name || !$email || !$password) {
    json_response(['error' => 'Name, email and password are required'], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_response(['error' => 'Invalid email address'], 400);
}

if (strlen($password) < 6) {
    json_response(['error' => 'Password must be at least 6 characters'], 400);
}

$stmt = $conn->prepare('SELECT id FROM users WHERE email = ?');
$stmt->bind_param('s', $email);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
    json_response(['error' => 'Email already registered'], 409);
}
$stmt->close();

$hashed = password_hash($password, PASSWORD_BCRYPT);
$stmt = $conn->prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
$stmt->bind_param('sss', $name, $email, $hashed);
if (!$stmt->execute()) {
    json_response(['error' => 'Registration failed'], 500);
}

json_response(['message' => 'Registration successful'], 201);
