<?php
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/auth.php';
require_once __DIR__ . '/../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

require_admin();

$data        = json_decode(file_get_contents('php://input'), true);
$id          = (int)($data['id'] ?? 0);
$name        = trim($data['name'] ?? '');
$description = trim($data['description'] ?? '');
$price       = (float)($data['price'] ?? 0);
$category    = trim($data['category'] ?? '');
$stock       = (int)($data['stock'] ?? 0);
$image       = trim($data['image'] ?? '');

if (!$id || !$name || !$price || !$category) {
    json_response(['error' => 'ID, name, price and category are required'], 400);
}

$stmt = $conn->prepare('UPDATE products SET name=?, description=?, price=?, image=?, category=?, stock=? WHERE id=?');
$stmt->bind_param('ssdssii', $name, $description, $price, $image, $category, $stock, $id);
if (!$stmt->execute()) {
    json_response(['error' => 'Failed to update product'], 500);
}

json_response(['message' => 'Product updated']);
