<?php

return function (): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $cfg = require __DIR__ . '/config.php';
        $d = $cfg['db'];
        $dsn = "mysql:host={$d['host']};dbname={$d['name']};charset=utf8mb4";
        $pdo = new PDO($dsn, $d['user'], $d['pass'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ]);
    }
    return $pdo;
};
