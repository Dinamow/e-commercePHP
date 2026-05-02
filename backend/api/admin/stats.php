<?php
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/auth.php';
require_once __DIR__ . '/../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['error' => 'Method not allowed'], 405);
}

require_admin();

$stats = [];

$row = $conn->query('SELECT COUNT(*) AS total FROM users WHERE role = "customer"')->fetch_assoc();
$stats['total_customers'] = (int)$row['total'];

$row = $conn->query('SELECT COUNT(*) AS total FROM products')->fetch_assoc();
$stats['total_products'] = (int)$row['total'];

$row = $conn->query('SELECT COUNT(*) AS total FROM orders')->fetch_assoc();
$stats['total_orders'] = (int)$row['total'];

$row = $conn->query('SELECT COALESCE(SUM(total), 0) AS revenue FROM orders WHERE status != "cancelled"')->fetch_assoc();
$stats['total_revenue'] = round((float)$row['revenue'], 2);

// Recent 5 orders
$result = $conn->query(
    'SELECT o.id, o.total, o.status, o.created_at, u.name AS customer
     FROM orders o JOIN users u ON o.user_id = u.id
     ORDER BY o.created_at DESC LIMIT 5'
);
$stats['recent_orders'] = $result->fetch_all(MYSQLI_ASSOC);

json_response(['stats' => $stats]);
