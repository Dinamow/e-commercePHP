<?php
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/auth.php';
require_once __DIR__ . '/../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['error' => 'Method not allowed'], 405);
}

require_auth();

$user_id = $_SESSION['user_id'];

$stmt = $conn->prepare(
    'SELECT c.id, c.quantity, p.id AS product_id, p.name, p.price, p.image, p.stock
     FROM cart c
     JOIN products p ON c.product_id = p.id
     WHERE c.user_id = ?'
);
$stmt->bind_param('i', $user_id);
$stmt->execute();
$result = $stmt->get_result();
$items  = $result->fetch_all(MYSQLI_ASSOC);
$stmt->close();

$total = array_sum(array_map(fn($i) => $i['price'] * $i['quantity'], $items));

json_response(['items' => $items, 'total' => round($total, 2)]);
