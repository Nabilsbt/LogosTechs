<?php

namespace UserService\Services;

use UserService\Models\User;
use UserService\Models\Role;
use UserService\Repositories\UserRepository;
use InvalidArgumentException;
use RuntimeException;

class UserService
{
    private UserRepository $userRepository;

    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function getAllUsers(): array
    {
        return $this->userRepository->findAll();
    }

    public function getUserById(int $id): ?User
    {
        return $this->userRepository->findById($id);
    }

    public function getUserByUsername(string $username): ?User
    {
        return $this->userRepository->findByUsername($username);
    }

    public function getUserByEmail(string $email): ?User
    {
        return $this->userRepository->findByEmail($email);
    }

    public function getUsersByRole(Role $role): array
    {
        return $this->userRepository->findByRole($role);
    }

    public function getActiveUsers(): array
    {
        return $this->userRepository->findActiveUsers();
    }

    public function searchUsersByName(string $name): array
    {
        if (empty(trim($name))) {
            throw new InvalidArgumentException('Search name cannot be empty');
        }
        
        return $this->userRepository->findByNameContaining($name);
    }

    public function getActiveUsersByRole(Role $role): array
    {
        $allUsers = $this->userRepository->findByRole($role);
        return array_filter($allUsers, fn($user) => $user->isActive());
    }

    public function countActiveUsersByRole(Role $role): int
    {
        return $this->userRepository->countActiveUsersByRole($role);
    }

    public function createUser(array $userData): User
    {
        $this->validateUserData($userData);
        
        // Check if username already exists
        if ($this->userRepository->existsByUsername($userData['username'])) {
            throw new RuntimeException("Username already exists: " . $userData['username']);
        }
        
        // Check if email already exists
        if ($this->userRepository->existsByEmail($userData['email'])) {
            throw new RuntimeException("Email already exists: " . $userData['email']);
        }
        
        $user = new User(
            $userData['username'],
            $userData['email'],
            $userData['password'], // Will be hashed in the setter
            $userData['firstName'],
            $userData['lastName'],
            Role::fromString($userData['role']),
            $userData['speciality'] ?? ''
        );
        
        // Hash password
        $user->setPassword($userData['password']);
        
        return $this->userRepository->save($user);
    }

    public function updateUser(int $id, array $userData): User
    {
        $user = $this->userRepository->findById($id);
        if (!$user) {
            throw new RuntimeException("User not found with id: $id");
        }
        
        // Update fields if provided
        if (isset($userData['firstName'])) {
            $user->setFirstName($userData['firstName']);
        }
        if (isset($userData['lastName'])) {
            $user->setLastName($userData['lastName']);
        }
        if (isset($userData['email'])) {
            // Check if new email already exists for another user
            $existingUser = $this->userRepository->findByEmail($userData['email']);
            if ($existingUser && $existingUser->getId() !== $id) {
                throw new RuntimeException("Email already exists: " . $userData['email']);
            }
            $user->setEmail($userData['email']);
        }
        if (isset($userData['role'])) {
            $user->setRole(Role::fromString($userData['role']));
        }
        if (isset($userData['speciality'])) {
            $user->setSpeciality($userData['speciality']);
        }
        if (isset($userData['active'])) {
            $user->setActive((bool) $userData['active']);
        }
        if (isset($userData['password']) && !empty($userData['password'])) {
            $user->setPassword($userData['password']);
        }
        
        return $this->userRepository->save($user);
    }

    public function deleteUser(int $id): bool
    {
        $user = $this->userRepository->findById($id);
        if (!$user) {
            throw new RuntimeException("User not found with id: $id");
        }
        
        return $this->userRepository->delete($id);
    }

    public function activateUser(int $id): User
    {
        $user = $this->userRepository->findById($id);
        if (!$user) {
            throw new RuntimeException("User not found with id: $id");
        }
        
        $user->activate();
        return $this->userRepository->save($user);
    }

    public function deactivateUser(int $id): User
    {
        $user = $this->userRepository->findById($id);
        if (!$user) {
            throw new RuntimeException("User not found with id: $id");
        }
        
        $user->deactivate();
        return $this->userRepository->save($user);
    }

    public function authenticateUser(string $username, string $password): ?User
    {
        $user = $this->userRepository->findByUsername($username);
        
        if (!$user || !$user->isActive()) {
            return null;
        }
        
        if ($user->verifyPassword($password)) {
            return $user;
        }
        
        return null;
    }

    private function validateUserData(array $userData): void
    {
        $required = ['username', 'email', 'password', 'firstName', 'lastName', 'role'];
        
        foreach ($required as $field) {
            if (!isset($userData[$field]) || empty(trim($userData[$field]))) {
                throw new InvalidArgumentException("Field '$field' is required");
            }
        }
        
        // Validate email format
        if (!filter_var($userData['email'], FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException("Invalid email format");
        }
        
        // Validate password length
        if (strlen($userData['password']) < 6) {
            throw new InvalidArgumentException("Password must be at least 6 characters long");
        }
        
        // Validate role
        try {
            Role::fromString($userData['role']);
        } catch (\InvalidArgumentException $e) {
            throw new InvalidArgumentException("Invalid role: " . $userData['role']);
        }
    }
}
