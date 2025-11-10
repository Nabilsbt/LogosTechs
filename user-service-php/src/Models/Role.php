<?php

namespace UserService\Models;

enum Role: string
{
    case ADMIN = 'ADMIN';
    case DOCTOR = 'DOCTOR';
    case NURSE = 'NURSE';
    case RECEPTIONIST = 'RECEPTIONIST';

    public function getLabel(): string
    {
        return match($this) {
            self::ADMIN => 'Administrateur',
            self::DOCTOR => 'Médecin',
            self::NURSE => 'Infirmière',
            self::RECEPTIONIST => 'Réceptionniste',
        };
    }

    public static function fromString(string $role): self
    {
        return match(strtoupper($role)) {
            'ADMIN' => self::ADMIN,
            'DOCTOR' => self::DOCTOR,
            'NURSE' => self::NURSE,
            'RECEPTIONIST' => self::RECEPTIONIST,
            default => throw new \InvalidArgumentException("Invalid role: $role")
        };
    }
}
