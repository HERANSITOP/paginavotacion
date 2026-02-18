<?php

namespace App\Model;

use App\Service\HashService;

class Vote
{
    public function __construct(
        private \PDO $pdo,
        private HashService $hash,
    ) {}

    public function hasVoted(string $email): bool
    {
        $hash = $this->hash->hash($email);
        $stmt = $this->pdo->prepare('SELECT 1 FROM votes WHERE email_hash = ? LIMIT 1');
        $stmt->execute([$hash]);
        return (bool) $stmt->fetch();
    }

    public function cast(string $email, int $optionId): bool
    {
        $hash = $this->hash->hash($email);
        $stmt = $this->pdo->prepare('INSERT INTO votes (email_hash, option_id) VALUES (?, ?)');
        return $stmt->execute([$hash, $optionId]);
    }

    public function getOptions(): array
    {
        $stmt = $this->pdo->query('SELECT id, name FROM options ORDER BY id');
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function getResults(): array
    {
        $stmt = $this->pdo->query('SELECT o.id, o.name, COALESCE(COUNT(v.id), 0) as count FROM options o LEFT JOIN votes v ON o.id = v.option_id GROUP BY o.id, o.name ORDER BY o.id');
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}
