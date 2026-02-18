<?php

require __DIR__ . '/../src/Config/bootstrap.php';

$config = require __DIR__ . '/../src/Config/config.php';
$pdo = (require __DIR__ . '/../src/Config/db.php')();
$q = trim($_GET['q'] ?? '', '/');
$clientIp = $_SERVER['REMOTE_ADDR'] ?? '';

$hash = new \App\Service\HashService();
$voteModel = new \App\Model\Vote($pdo, $hash);
$geo = new \App\Service\GeoService();

$routes = [
    '' => fn() => (new \App\Controller\HomeController($voteModel))->index(),
    'auth/google' => fn() => (new \App\Controller\AuthController($config))->google(),
    'auth/callback' => fn() => (new \App\Controller\AuthController($config))->callback(),
    'auth/logout' => fn() => (new \App\Controller\AuthController($config))->logout(),
    'vote' => fn() => $voteModel ? (new \App\Controller\VoteController($voteModel, $geo, $clientIp))->form() : die('Error de configuración'),
    'vote/submit' => fn() => $voteModel ? (new \App\Controller\VoteController($voteModel, $geo, $clientIp))->submit() : die('Error de configuración'),
    'thanks' => fn() => $voteModel ? (new \App\Controller\VoteController($voteModel, $geo, $clientIp))->thanks() : die('Error de configuración'),
];

$handler = $routes[$q] ?? null;
if ($handler) {
    $handler();
} else {
    http_response_code(404);
    $layout = file_get_contents(__DIR__ . '/../src/View/layouts/main.php');
    $content = file_get_contents(__DIR__ . '/../src/View/pages/404.php');
    echo str_replace('{{CONTENT}}', $content, $layout);
}
