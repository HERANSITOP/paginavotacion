<?php

namespace App\Service;

class HashService
{
    private function normalize(string $email): string
    {
        return strtolower(trim($email));
    }

    /**
     * Voter identifier.
     *
     * If HASH_PEPPER is set, returns HMAC-SHA256(SHA256(email), pepper) to protect against DB leaks.
     * This form is also migratable from existing SHA256(email) values without needing the email again.
     *
     * If HASH_PEPPER is empty, falls back to SHA256(email).
     */
    public function hash(string $email): string
    {
        $normalized = $this->normalize($email);
        $legacy = hash('sha256', $normalized);
        $pepper = getenv('HASH_PEPPER') ?: '';
        if ($pepper === '') {
            return $legacy;
        }
        return hash_hmac('sha256', $legacy, $pepper);
    }
}
