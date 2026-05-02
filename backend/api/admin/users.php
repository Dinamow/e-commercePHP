<?php
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/auth.php';
require_once __DIR__ . '/../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['error' => 'Method not allowed'], 405);
}

require_admin();

$result = $conn->query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
$users  = $result->fetch_all(MYSQLI_ASSOC);

json_response(['users' => $users]);
