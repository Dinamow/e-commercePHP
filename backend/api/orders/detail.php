<?php
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/auth.php';
require_once __DIR__ . '/../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['error' => 'Method not allowed'], 405);
}

require_auth();

$order_id = (int)($_GET['id'] ?? 0);
$user_id  = $_SESSION['user_id'];

if (!$order_id) {
    json_response(['error' => 'Order ID required'], 400);
}

$stmt = $conn->prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?');
$stmt->bind_param('ii', $order_id, $user_id);
$stmt->execute();
$result = $stmt->get_result();
$order  = $result->fetch_assoc();
$stmt->close();

if (!$order) {
    json_response(['error' => 'Order not found'], 404);
}

$stmt = $conn->prepare(
    'SELECT oi.*, p.name, p.image FROM order_items oi
     JOIN products p ON oi.product_id = p.id
     WHERE oi.order_id = ?'
);
$stmt->bind_param('i', $order_id);
$stmt->execute();
$result       = $stmt->get_result();
$order['items'] = $result->fetch_all(MYSQLI_ASSOC);
$stmt->close();

json_response(['order' => $order]);
