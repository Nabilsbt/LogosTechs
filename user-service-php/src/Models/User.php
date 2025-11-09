<?php

namespace UserService\Models;

use DateTime;
use JsonSerializable;

class User implements JsonSerializable
{
    private ?int $id = null;
    private string $username;
    private string $email;
    private string $password;
    private string $firstName;
    private string $lastName;
    private Role $role;
    private string $speciality;
    private bool $active = true;
    private DateTime $createdAt;
    private DateTime $updatedAt;

    public function __construct(
        string $username,
        string $email,
        string $password,
        string $firstName,
        string $lastName,
        Role $role,
        string $speciality = ''
    ) {
        $this->username = $username;
        $this->email = $email;
        $this->password = $password;
        $this->firstName = $firstName;
        $this->lastName = $lastName;
        $this->role = $role;
        $this->speciality = $speciality;
        $this->createdAt = new DateTime();
        $this->updatedAt = new DateTime();
    }

    // Getters
    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUsername(): string
    {
        return $this->username;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function getPassword(): string
    {
        return $this->password;
    }

    public function getFirstName(): string
    {
        return $this->firstName;
    }

    public function getLastName(): string
    {
        return $this->lastName;
    }

    public function getFullName(): string
    {
        return $this->firstName . ' ' . $this->lastName;
    }

    public function getRole(): Role
    {
        return $this->role;
    }

    public function getSpeciality(): string
    {
        return $this->speciality;
    }

    public function isActive(): bool
    {
        return $this->active;
    }

    public function getCreatedAt(): DateTime
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): DateTime
    {
        return $this->updatedAt;
    }

    // Setters
    public function setId(int $id): void
    {
        $this->id = $id;
    }

    public function setUsername(string $username): void
    {
        $this->username = $username;
    }

    public function setEmail(string $email): void
    {
        $this->email = $email;
    }

    public function setPassword(string $password): void
    {
        $this->password = password_hash($password, PASSWORD_DEFAULT);
    }

    public function setFirstName(string $firstName): void
    {
        $this->firstName = $firstName;
    }

    public function setLastName(string $lastName): void
    {
        $this->lastName = $lastName;
    }

    public function setRole(Role $role): void
    {
        $this->role = $role;
    }

    public function setSpeciality(string $speciality): void
    {
        $this->speciality = $speciality;
    }

    public function setActive(bool $active): void
    {
        $this->active = $active;
        $this->updatedAt = new DateTime();
    }

    public function setCreatedAt(DateTime $createdAt): void
    {
        $this->createdAt = $createdAt;
    }

    public function setUpdatedAt(DateTime $updatedAt): void
    {
        $this->updatedAt = $updatedAt;
    }

    // Utility methods
    public function verifyPassword(string $password): bool
    {
        return password_verify($password, $this->password);
    }

    public function activate(): void
    {
        $this->setActive(true);
    }

    public function deactivate(): void
    {
        $this->setActive(false);
    }

    // JsonSerializable implementation
    public function jsonSerialize(): array
    {
        return [
            'id' => $this->id,
            'username' => $this->username,
            'email' => $this->email,
            'firstName' => $this->firstName,
            'lastName' => $this->lastName,
            'fullName' => $this->getFullName(),
            'role' => $this->role->value,
            'roleLabel' => $this->role->getLabel(),
            'speciality' => $this->speciality,
            'active' => $this->active,
            'createdAt' => $this->createdAt->format('Y-m-d H:i:s'),
            'updatedAt' => $this->updatedAt->format('Y-m-d H:i:s')
        ];
    }

    // Factory method from array
    public static function fromArray(array $data): self
    {
        $user = new self(
            $data['username'],
            $data['email'],
            $data['password'],
            $data['firstName'],
            $data['lastName'],
            Role::fromString($data['role']),
            $data['speciality'] ?? ''
        );

        if (isset($data['id'])) {
            $user->setId($data['id']);
        }
        if (isset($data['active'])) {
            $user->setActive((bool)$data['active']);
        }
        if (isset($data['createdAt'])) {
            $user->setCreatedAt(new DateTime($data['createdAt']));
        }
        if (isset($data['updatedAt'])) {
            $user->setUpdatedAt(new DateTime($data['updatedAt']));
        }

        return $user;
    }
}
