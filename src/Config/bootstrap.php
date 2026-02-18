<?php

require __DIR__ . '/../../vendor/autoload.php';
require __DIR__ . '/env.php';

$pdo = (require __DIR__ . '/db.php')();
$handler = new \App\Model\Session($pdo);
session_set_save_handler($handler, true);
session_start();
