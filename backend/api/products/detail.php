<?php
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['error' => 'Method not allowed'], 405);
}

$id = (int)($_GET['id'] ?? 0);
if (!$id) {
    json_response(['error' => 'Product ID required'], 400);
}

$stmt = $conn->prepare('SELECT * FROM products WHERE id = ?');
$stmt->bind_param('i', $id);
$stmt->execute();
$result  = $stmt->get_result();
$product = $result->fetch_assoc();
$stmt->close();

if (!$product) {
    json_response(['error' => 'Product not found'], 404);
}

json_response(['product' => $product]);
