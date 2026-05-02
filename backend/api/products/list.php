<?php
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['error' => 'Method not allowed'], 405);
}

$search   = '%' . ($conn->real_escape_string($_GET['search'] ?? '')) . '%';
$category = $_GET['category'] ?? '';

if ($category) {
    $stmt = $conn->prepare('SELECT * FROM products WHERE (name LIKE ? OR description LIKE ?) AND category = ? ORDER BY created_at DESC');
    $stmt->bind_param('sss', $search, $search, $category);
} else {
    $stmt = $conn->prepare('SELECT * FROM products WHERE name LIKE ? OR description LIKE ? ORDER BY created_at DESC');
    $stmt->bind_param('ss', $search, $search);
}

$stmt->execute();
$result   = $stmt->get_result();
$products = $result->fetch_all(MYSQLI_ASSOC);
$stmt->close();

// Get distinct categories for filter
$cats   = $conn->query('SELECT DISTINCT category FROM products ORDER BY category');
$categories = [];
while ($row = $cats->fetch_assoc()) {
    $categories[] = $row['category'];
}

json_response(['products' => $products, 'categories' => $categories]);
