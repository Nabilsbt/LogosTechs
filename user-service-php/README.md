# User Service PHP - LogosTech Hospital Management

## 🐘 Description
Microservice de gestion des utilisateurs développé en PHP avec Slim Framework pour l'architecture microservices LogosTech.

## 🏗️ Architecture
- **Framework**: Slim 4
- **Base de données**: PostgreSQL
- **Port**: 8081
- **Pattern**: Repository + Service + Controller

## 👤 Types d'Utilisateurs
- **ADMIN** - Administrateur système
- **DOCTOR** - Médecins
- **NURSE** - Infirmières  
- **RECEPTIONIST** - Personnel d'accueil

## 🚀 Installation

### Prérequis
- PHP 8.0+
- Composer
- PostgreSQL
- Extension PDO PostgreSQL

### Étapes d'installation

1. **Installer les dépendances**
```bash
cd user-service-php
composer install
```

2. **Configurer la base de données**
```bash
# Créer la base de données PostgreSQL
createdb user_db
psql user_db < database/create_tables.sql
```

3. **Configurer l'environnement**
```bash
# Copier et modifier le fichier .env
cp .env.example .env
# Modifier les paramètres de connexion DB
```

4. **Démarrer le service**
```bash
composer start
# ou
php -S localhost:8081 -t public
```

## 📡 API Endpoints

### Base URL: `http://localhost:8081`

#### Utilisateurs
- `GET /api/users` - Liste tous les utilisateurs
- `GET /api/users/{id}` - Utilisateur par ID
- `GET /api/users/username/{username}` - Utilisateur par nom d'utilisateur
- `GET /api/users/role/{role}` - Utilisateurs par rôle
- `GET /api/users/active` - Utilisateurs actifs
- `GET /api/users/search?name={name}` - Recherche par nom
- `GET /api/users/count/role/{role}` - Nombre d'utilisateurs par rôle

#### Gestion
- `POST /api/users` - Créer un utilisateur
- `PUT /api/users/{id}` - Modifier un utilisateur
- `PUT /api/users/{id}/activate` - Activer un utilisateur
- `PUT /api/users/{id}/deactivate` - Désactiver un utilisateur
- `DELETE /api/users/{id}` - Supprimer un utilisateur

#### Système
- `GET /health` - Vérification de santé
- `GET /` - Documentation API

## 📝 Exemples d'utilisation

### Créer un utilisateur
```bash
curl -X POST http://localhost:8081/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "dr.dupont",
    "email": "dupont@hospital.com",
    "password": "password123",
    "firstName": "Pierre",
    "lastName": "Dupont",
    "role": "DOCTOR",
    "speciality": "Neurologie"
  }'
```

### Obtenir tous les médecins
```bash
curl http://localhost:8081/api/users/role/DOCTOR
```

### Rechercher un utilisateur
```bash
curl "http://localhost:8081/api/users/search?name=martin"
```

## 🔧 Configuration

### Variables d'environnement (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=user_db
DB_USER=user_admin
DB_PASSWORD=user_password
DB_DRIVER=pdo_pgsql
APP_PORT=8081
JWT_SECRET=your-secret-key
CORS_ORIGINS=*
```

## 🗄️ Structure de la base de données

### Table `users`
```sql
- id (SERIAL PRIMARY KEY)
- username (VARCHAR UNIQUE)
- email (VARCHAR UNIQUE)
- password (VARCHAR - hashed)
- first_name (VARCHAR)
- last_name (VARCHAR)
- role (ENUM: ADMIN, DOCTOR, NURSE, RECEPTIONIST)
- speciality (VARCHAR)
- active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## 🧪 Tests

### Utilisateurs par défaut
- **admin** / password - Administrateur
- **dr.martin** / password - Médecin Cardiologue
- **nurse.sophie** / password - Infirmière Urgences
- **reception.marie** / password - Réceptionniste

## 🔗 Intégration Microservices
Ce service s'intègre avec :
- **Urgences Service** (Java/Spring Boot) - Port 8082
- **Config Server** - Port 8888
- **Eureka Server** - Port 8761
- **API Gateway** - Port 8080

## 📊 Monitoring
- Endpoint de santé : `/health`
- Logs d'erreurs intégrés
- Métriques de performance disponibles

## 🛠️ Développement
Structure du projet :
```
user-service-php/
├── src/
│   ├── Controllers/     # Contrôleurs REST
│   ├── Services/        # Logique métier
│   ├── Repositories/    # Accès données
│   └── Models/          # Entités
├── config/              # Configuration
├── database/            # Scripts SQL
├── public/              # Point d'entrée
└── composer.json        # Dépendances
```
