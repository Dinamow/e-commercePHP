<?php
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/auth.php';
require_once __DIR__ . '/../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['error' => 'Method not allowed'], 405);
}

require_auth();

$user_id = $_SESSION['user_id'];

$stmt = $conn->prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC');
$stmt->bind_param('i', $user_id);
$stmt->execute();
$result = $stmt->get_result();
$orders = $result->fetch_all(MYSQLI_ASSOC);
$stmt->close();

json_response(['orders' => $orders]);
