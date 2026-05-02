<?php
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/auth.php';
require_once __DIR__ . '/../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

require_auth();

$data     = json_decode(file_get_contents('php://input'), true);
$cart_id  = (int)($data['cart_id'] ?? 0);
$quantity = (int)($data['quantity'] ?? 0);
$user_id  = $_SESSION['user_id'];

if (!$cart_id || $quantity < 1) {
    json_response(['error' => 'Valid cart_id and quantity required'], 400);
}

$stmt = $conn->prepare('UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?');
$stmt->bind_param('iii', $quantity, $cart_id, $user_id);
if (!$stmt->execute()) {
    json_response(['error' => 'Failed to update cart'], 500);
}

json_response(['message' => 'Cart updated']);
