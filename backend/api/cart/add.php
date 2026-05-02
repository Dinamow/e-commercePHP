<?php
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/auth.php';
require_once __DIR__ . '/../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

require_auth();

$data       = json_decode(file_get_contents('php://input'), true);
$product_id = (int)($data['product_id'] ?? 0);
$quantity   = (int)($data['quantity'] ?? 1);
$user_id    = $_SESSION['user_id'];

if (!$product_id || $quantity < 1) {
    json_response(['error' => 'Valid product_id and quantity required'], 400);
}

// Check product exists and has stock
$stmt = $conn->prepare('SELECT id, stock FROM products WHERE id = ?');
$stmt->bind_param('i', $product_id);
$stmt->execute();
$result  = $stmt->get_result();
$product = $result->fetch_assoc();
$stmt->close();

if (!$product) {
    json_response(['error' => 'Product not found'], 404);
}
if ($product['stock'] < $quantity) {
    json_response(['error' => 'Not enough stock'], 400);
}

// Insert or update quantity
$stmt = $conn->prepare(
    'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE quantity = quantity + ?'
);
$stmt->bind_param('iiii', $user_id, $product_id, $quantity, $quantity);
if (!$stmt->execute()) {
    json_response(['error' => 'Failed to add to cart'], 500);
}

json_response(['message' => 'Added to cart']);
