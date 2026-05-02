<?php
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/auth.php';
require_once __DIR__ . '/../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    json_response(['error' => 'Method not allowed'], 405);
}

require_admin();

$id = (int)($_GET['id'] ?? 0);
if (!$id) {
    json_response(['error' => 'Product ID required'], 400);
}

$stmt = $conn->prepare('DELETE FROM products WHERE id = ?');
$stmt->bind_param('i', $id);
if (!$stmt->execute()) {
    json_response(['error' => 'Failed to delete product'], 500);
}

json_response(['message' => 'Product deleted']);
