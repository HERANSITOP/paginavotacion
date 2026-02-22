<?php

namespace App\Model;

use App\Service\HashService;

class Vote
{
    public function __construct(
        private \PDO $pdo,
        private HashService $hash,
    ) {}

    public function hasVotedHash(string $emailHash): bool
    {
        $stmt = $this->pdo->prepare('SELECT 1 FROM voters WHERE email_hash = ? LIMIT 1');
        $stmt->execute([$emailHash]);
        return (bool) $stmt->fetch();
    }

    public function hasVoted(string $email): bool
    {
        return $this->hasVotedHash($this->hash->hash($email));
    }

    public function castHash(string $emailHash, int $optionId): bool
    {
        $this->pdo->beginTransaction();
        try {
            // Insert voter hash first: unique constraint prevents duplicate votes.
            $stmt = $this->pdo->prepare('INSERT INTO voters (email_hash) VALUES (?)');
            $stmt->execute([$emailHash]);

            // Vote row stays unlinkable to the voter hash.
            $stmt = $this->pdo->prepare('INSERT INTO votes (option_id) VALUES (?)');
            $stmt->execute([$optionId]);

            $this->pdo->commit();
            return true;
        } catch (\PDOException $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            return false;
        }
    }

    public function cast(string $email, int $optionId): bool
    {
        return $this->castHash($this->hash->hash($email), $optionId);
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
