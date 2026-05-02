<?php
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/auth.php';
require_once __DIR__ . '/../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    json_response(['error' => 'Method not allowed'], 405);
}

require_auth();

$cart_id = (int)($_GET['id'] ?? 0);
$user_id = $_SESSION['user_id'];

if (!$cart_id) {
    json_response(['error' => 'Cart item ID required'], 400);
}

$stmt = $conn->prepare('DELETE FROM cart WHERE id = ? AND user_id = ?');
$stmt->bind_param('ii', $cart_id, $user_id);
if (!$stmt->execute()) {
    json_response(['error' => 'Failed to remove item'], 500);
}

json_response(['message' => 'Item removed']);
