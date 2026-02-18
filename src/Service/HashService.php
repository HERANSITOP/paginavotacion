<?php

namespace App\Service;

class HashService
{
    public function hash(string $email): string
    {
        return hash('sha256', strtolower(trim($email)));
    }
}
