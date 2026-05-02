<?php
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/auth.php';
require_once __DIR__ . '/../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

require_auth();

$data             = json_decode(file_get_contents('php://input'), true);
$shipping_address = trim($data['shipping_address'] ?? '');
$user_id          = $_SESSION['user_id'];

if (!$shipping_address) {
    json_response(['error' => 'Shipping address is required'], 400);
}

// Get cart items
$stmt = $conn->prepare(
    'SELECT c.id AS cart_id, c.quantity, p.id AS product_id, p.price, p.stock
     FROM cart c JOIN products p ON c.product_id = p.id
     WHERE c.user_id = ?'
);
$stmt->bind_param('i', $user_id);
$stmt->execute();
$result = $stmt->get_result();
$items  = $result->fetch_all(MYSQLI_ASSOC);
$stmt->close();

if (empty($items)) {
    json_response(['error' => 'Cart is empty'], 400);
}

// Check stock for all items
foreach ($items as $item) {
    if ($item['stock'] < $item['quantity']) {
        json_response(['error' => 'Not enough stock for one or more items'], 400);
    }
}

$total = array_sum(array_map(fn($i) => $i['price'] * $i['quantity'], $items));

$conn->begin_transaction();
try {
    // Create order
    $stmt = $conn->prepare('INSERT INTO orders (user_id, total, shipping_address) VALUES (?, ?, ?)');
    $stmt->bind_param('ids', $user_id, $total, $shipping_address);
    $stmt->execute();
    $order_id = $stmt->insert_id;
    $stmt->close();

    // Insert order items and reduce stock
    foreach ($items as $item) {
        $stmt = $conn->prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
        $stmt->bind_param('iiid', $order_id, $item['product_id'], $item['quantity'], $item['price']);
        $stmt->execute();
        $stmt->close();

        $stmt = $conn->prepare('UPDATE products SET stock = stock - ? WHERE id = ?');
        $stmt->bind_param('ii', $item['quantity'], $item['product_id']);
        $stmt->execute();
        $stmt->close();
    }

    // Clear cart
    $stmt = $conn->prepare('DELETE FROM cart WHERE user_id = ?');
    $stmt->bind_param('i', $user_id);
    $stmt->execute();
    $stmt->close();

    $conn->commit();
} catch (Exception $e) {
    $conn->rollback();
    json_response(['error' => 'Order failed, please try again'], 500);
}

json_response(['message' => 'Order placed successfully', 'order_id' => $order_id], 201);
