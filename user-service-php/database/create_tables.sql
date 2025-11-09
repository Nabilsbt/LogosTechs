-- Create database (run this first as superuser)
-- CREATE DATABASE user_db OWNER user_admin;

-- Connect to user_db and run the following:

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')),
    speciality VARCHAR(100) DEFAULT '',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Insert default admin user
INSERT INTO users (username, email, password, first_name, last_name, role, speciality, active)
VALUES (
    'admin',
    'admin@logostech.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    'System',
    'Administrator',
    'ADMIN',
    'System Administration',
    TRUE
) ON CONFLICT (username) DO NOTHING;

-- Insert sample users
INSERT INTO users (username, email, password, first_name, last_name, role, speciality, active)
VALUES 
    (
        'dr.martin',
        'martin@logostech.com',
        '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'Jean',
        'Martin',
        'DOCTOR',
        'Cardiologie',
        TRUE
    ),
    (
        'nurse.sophie',
        'sophie@logostech.com',
        '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'Sophie',
        'Dubois',
        'NURSE',
        'Urgences',
        TRUE
    ),
    (
        'reception.marie',
        'marie@logostech.com',
        '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'Marie',
        'Durand',
        'RECEPTIONIST',
        'Accueil',
        TRUE
    )
ON CONFLICT (username) DO NOTHING;
