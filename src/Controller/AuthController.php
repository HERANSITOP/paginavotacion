<?php

namespace App\Controller;

use Google\Client;

class AuthController
{
    public function __construct(private array $config) {}

    public function google(): void
    {
        $client = $this->createClient();
        $client->addScope('email');
        $client->setPrompt('consent select_account');
        header('Location: ' . $client->createAuthUrl());
        exit;
    }

    public function callback(): void
    {
        $code = $_GET['code'] ?? null;
        if (!$code) {
            $_SESSION['error'] = 'No se recibió autorización.';
            header('Location: /');
            exit;
        }
        $client = $this->createClient();
        $token = $client->fetchAccessTokenWithAuthCode($code);
        if (isset($token['error'])) {
            $_SESSION['error'] = 'Error al autenticar.';
            header('Location: /');
            exit;
        }
        $email = json_decode(file_get_contents('https://www.googleapis.com/oauth2/v2/userinfo?access_token=' . $token['access_token']), true)['email'] ?? '';
        if (!str_ends_with(strtolower($email), '@unal.edu.co')) {
            $_SESSION['error'] = 'Solo correos @unal.edu.co';
            header('Location: /');
            exit;
        }
        $_SESSION['user_email'] = $email;
        unset($_SESSION['error']);
        header('Location: /vote');
        exit;
    }

    public function logout(): void
    {
        session_destroy();
        header('Location: /');
        exit;
    }

    private function createClient(): Client
    {
        $client = new Client();
        $client->setClientId($this->config['google']['client_id']);
        $client->setClientSecret($this->config['google']['client_secret']);
        $client->setRedirectUri($this->config['base_url'] . '/auth/callback');
        return $client;
    }
}
