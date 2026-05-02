<?php
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/auth.php';
require_once __DIR__ . '/../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

require_admin();

$data        = json_decode(file_get_contents('php://input'), true);
$name        = trim($data['name'] ?? '');
$description = trim($data['description'] ?? '');
$price       = (float)($data['price'] ?? 0);
$category    = trim($data['category'] ?? '');
$stock       = (int)($data['stock'] ?? 0);
$image       = trim($data['image'] ?? '');

if (!$name || !$price || !$category) {
    json_response(['error' => 'Name, price and category are required'], 400);
}

$stmt = $conn->prepare('INSERT INTO products (name, description, price, image, category, stock) VALUES (?, ?, ?, ?, ?, ?)');
$stmt->bind_param('ssdssi', $name, $description, $price, $image, $category, $stock);
if (!$stmt->execute()) {
    json_response(['error' => 'Failed to create product'], 500);
}

$id = $stmt->insert_id;
$stmt->close();

json_response(['message' => 'Product created', 'id' => $id], 201);
