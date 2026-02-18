<?php
$code = (int) ($_SERVER['REDIRECT_STATUS'] ?? $_GET['code'] ?? 404);
http_response_code($code);
$title = $code === 403 ? 'Error 403' : 'Error 404';
$msg = $code === 403
    ? 'No tienes permiso para acceder a este recurso.'
    : 'La página que buscas no existe o no tienes permiso para acceder.';

$layout = file_get_contents(__DIR__ . '/../src/View/layouts/main.php');
$content = '<div class="card"><h1>' . htmlspecialchars($title) . '</h1><p>' . htmlspecialchars($msg) . '</p><a href="/" class="btn">Volver al inicio</a></div>';
echo str_replace('{{CONTENT}}', $content, $layout);
