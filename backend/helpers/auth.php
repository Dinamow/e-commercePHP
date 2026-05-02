<?php
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => 86400,
        'path'     => '/',
        'samesite' => 'Lax',
        'httponly' => true,
    ]);
    session_start();
}

function require_auth() {
    if (empty($_SESSION['user_id'])) {
        json_response(['error' => 'Unauthorized'], 401);
    }
}

function require_admin() {
    require_auth();
    if ($_SESSION['role'] !== 'admin') {
        json_response(['error' => 'Forbidden'], 403);
    }
}
