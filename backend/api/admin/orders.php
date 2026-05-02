<?php
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/auth.php';
require_once __DIR__ . '/../../config/database.php';

require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $result = $conn->query(
        'SELECT o.id, o.total, o.status, o.shipping_address, o.created_at, u.name AS customer, u.email
         FROM orders o JOIN users u ON o.user_id = u.id
         ORDER BY o.created_at DESC'
    );
    $orders = $result->fetch_all(MYSQLI_ASSOC);
    json_response(['orders' => $orders]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data     = json_decode(file_get_contents('php://input'), true);
    $order_id = (int)($data['order_id'] ?? 0);
    $status   = $data['status'] ?? '';
    $allowed  = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!$order_id || !in_array($status, $allowed)) {
        json_response(['error' => 'Valid order_id and status required'], 400);
    }

    $stmt = $conn->prepare('UPDATE orders SET status = ? WHERE id = ?');
    $stmt->bind_param('si', $status, $order_id);
    if (!$stmt->execute()) {
        json_response(['error' => 'Failed to update order'], 500);
    }
    json_response(['message' => 'Order status updated']);
}

json_response(['error' => 'Method not allowed'], 405);
