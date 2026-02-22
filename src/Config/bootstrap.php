<?php

require __DIR__ . '/../../vendor/autoload.php';
require __DIR__ . '/env.php';

// Use default PHP session storage (filesystem). This avoids persisting session data in DB.
// Cookie hardening (works only if site is served over HTTPS).
$ttlSeconds = 30 * 60;
ini_set('session.gc_maxlifetime', (string) $ttlSeconds);
ini_set('session.gc_probability', '1');
ini_set('session.gc_divisor', '100');

$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (isset($_SERVER['SERVER_PORT']) && (int) $_SERVER['SERVER_PORT'] === 443);
session_set_cookie_params([
    'lifetime' => $ttlSeconds,
    'path' => '/',
    'secure' => $isHttps,
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();
