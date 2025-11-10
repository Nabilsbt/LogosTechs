<?php

namespace UserService\Repositories;

use Doctrine\DBAL\Connection;
use UserService\Models\User;
use UserService\Models\Role;
use DateTime;

class UserRepository
{
    private Connection $connection;

    public function __construct(Connection $connection)
    {
        $this->connection = $connection;
    }

    public function findAll(): array
    {
        $sql = 'SELECT * FROM users ORDER BY created_at DESC';
        $result = $this->connection->executeQuery($sql);
        
        $users = [];
        while ($row = $result->fetchAssociative()) {
            $users[] = $this->mapRowToUser($row);
        }
        
        return $users;
    }

    public function findById(int $id): ?User
    {
        $sql = 'SELECT * FROM users WHERE id = ?';
        $result = $this->connection->executeQuery($sql, [$id]);
        $row = $result->fetchAssociative();
        
        return $row ? $this->mapRowToUser($row) : null;
    }

    public function findByUsername(string $username): ?User
    {
        $sql = 'SELECT * FROM users WHERE username = ?';
        $result = $this->connection->executeQuery($sql, [$username]);
        $row = $result->fetchAssociative();
        
        return $row ? $this->mapRowToUser($row) : null;
    }

    public function findByEmail(string $email): ?User
    {
        $sql = 'SELECT * FROM users WHERE email = ?';
        $result = $this->connection->executeQuery($sql, [$email]);
        $row = $result->fetchAssociative();
        
        return $row ? $this->mapRowToUser($row) : null;
    }

    public function findByRole(Role $role): array
    {
        $sql = 'SELECT * FROM users WHERE role = ? ORDER BY created_at DESC';
        $result = $this->connection->executeQuery($sql, [$role->value]);
        
        $users = [];
        while ($row = $result->fetchAssociative()) {
            $users[] = $this->mapRowToUser($row);
        }
        
        return $users;
    }

    public function findActiveUsers(): array
    {
        $sql = 'SELECT * FROM users WHERE active = true ORDER BY created_at DESC';
        $result = $this->connection->executeQuery($sql);
        
        $users = [];
        while ($row = $result->fetchAssociative()) {
            $users[] = $this->mapRowToUser($row);
        }
        
        return $users;
    }

    public function findByNameContaining(string $name): array
    {
        $sql = 'SELECT * FROM users WHERE first_name ILIKE ? OR last_name ILIKE ? ORDER BY created_at DESC';
        $searchTerm = '%' . $name . '%';
        $result = $this->connection->executeQuery($sql, [$searchTerm, $searchTerm]);
        
        $users = [];
        while ($row = $result->fetchAssociative()) {
            $users[] = $this->mapRowToUser($row);
        }
        
        return $users;
    }

    public function countActiveUsersByRole(Role $role): int
    {
        $sql = 'SELECT COUNT(*) FROM users WHERE role = ? AND active = true';
        $result = $this->connection->executeQuery($sql, [$role->value]);
        
        return (int) $result->fetchOne();
    }

    public function existsByUsername(string $username): bool
    {
        $sql = 'SELECT COUNT(*) FROM users WHERE username = ?';
        $result = $this->connection->executeQuery($sql, [$username]);
        
        return (int) $result->fetchOne() > 0;
    }

    public function existsByEmail(string $email): bool
    {
        $sql = 'SELECT COUNT(*) FROM users WHERE email = ?';
        $result = $this->connection->executeQuery($sql, [$email]);
        
        return (int) $result->fetchOne() > 0;
    }

    public function save(User $user): User
    {
        if ($user->getId() === null) {
            return $this->insert($user);
        } else {
            return $this->update($user);
        }
    }

    private function insert(User $user): User
    {
        $sql = 'INSERT INTO users (username, email, password, first_name, last_name, role, speciality, active, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id';
        
        $result = $this->connection->executeQuery($sql, [
            $user->getUsername(),
            $user->getEmail(),
            $user->getPassword(),
            $user->getFirstName(),
            $user->getLastName(),
            $user->getRole()->value,
            $user->getSpeciality(),
            $user->isActive(),
            $user->getCreatedAt()->format('Y-m-d H:i:s'),
            $user->getUpdatedAt()->format('Y-m-d H:i:s')
        ]);
        
        $id = $result->fetchOne();
        $user->setId((int) $id);
        
        return $user;
    }

    private function update(User $user): User
    {
        $sql = 'UPDATE users SET 
                username = ?, email = ?, password = ?, first_name = ?, last_name = ?, 
                role = ?, speciality = ?, active = ?, updated_at = ? 
                WHERE id = ?';
        
        $user->setUpdatedAt(new DateTime());
        
        $this->connection->executeStatement($sql, [
            $user->getUsername(),
            $user->getEmail(),
            $user->getPassword(),
            $user->getFirstName(),
            $user->getLastName(),
            $user->getRole()->value,
            $user->getSpeciality(),
            $user->isActive(),
            $user->getUpdatedAt()->format('Y-m-d H:i:s'),
            $user->getId()
        ]);
        
        return $user;
    }

    public function delete(int $id): bool
    {
        $sql = 'DELETE FROM users WHERE id = ?';
        $affectedRows = $this->connection->executeStatement($sql, [$id]);
        
        return $affectedRows > 0;
    }

    private function mapRowToUser(array $row): User
    {
        $user = new User(
            $row['username'],
            $row['email'],
            $row['password'], // Already hashed
            $row['first_name'],
            $row['last_name'],
            Role::fromString($row['role']),
            $row['speciality'] ?? ''
        );
        
        $user->setId((int) $row['id']);
        $user->setActive((bool) $row['active']);
        $user->setCreatedAt(new DateTime($row['created_at']));
        $user->setUpdatedAt(new DateTime($row['updated_at']));
        
        return $user;
    }
}
