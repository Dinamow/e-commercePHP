CREATE DATABASE IF NOT EXISTS ecommerce;
USE ecommerce;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image VARCHAR(255),
    category VARCHAR(100),
    stock INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    shipping_address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    UNIQUE KEY unique_cart_item (user_id, product_id)
);

-- Seed admin user (password: admin123)
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@store.com', '$2y$10$SevzR5eKirgh1S6DDJEpoe3Jutz/FXnG2G4bSVzqXAdfpv.IyzS32', 'admin');

-- Seed products
INSERT INTO products (name, description, price, image, category, stock) VALUES
('Wireless Headphones', 'High quality bluetooth headphones with 30-hour battery life and premium sound.', 59.99, 'https://th.bing.com/th/id/OIP.7Rpt53WF85APw_WhnFxVIgHaK5?r=0&o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3', 'Electronics', 50),
('Running Shoes', 'Lightweight and comfortable athletic shoes ideal for running and gym.', 89.99, 'https://media.glamour.com/photos/62ba1868b5be8e000f783acb/16:9/w_2580,c_limit/best%20running%20shoes%20for%20women.png', 'Clothing', 30),
('Backpack', 'Durable 30L travel backpack with laptop compartment and multiple pockets.', 45.99, 'https://m.media-amazon.com/images/I/61Va+gdgMoL._AC_SL1500_.jpg', 'Accessories', 25),
('Smart Watch', 'Fitness tracking smart watch with heart rate monitor and GPS.', 199.99, 'https://m.media-amazon.com/images/I/61ftG19NACL._AC_SL1500_.jpg', 'Electronics', 20),
('Coffee Mug', 'Ceramic coffee mug 350ml, microwave and dishwasher safe.', 12.99, 'https://m.media-amazon.com/images/I/71u6gAsrQ4L._AC_SL1500_.jpg', 'Home', 100),
('Desk Lamp', 'LED adjustable desk lamp with 3 color modes and USB charging port.', 34.99, 'https://m.media-amazon.com/images/I/61PjBQFSljL._AC_SL1446_.jpg', 'Home', 40);
