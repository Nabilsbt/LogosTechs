# LogosTech - Architecture Microservices pour Gestion Hospitalière

## 🏥 Description
Projet d'architecture microservices pour la gestion d'un système hospitalier développé dans le cadre du cours d'architecture microservices.

## 🏗️ Architecture

### Microservices Implémentés

#### 1. **User Service** (Port 8081)
- **Description** : Gestion des utilisateurs du système hospitalier
- **Base de données** : PostgreSQL
- **Entités** :
  - `User` : Utilisateurs avec rôles (ADMIN, DOCTOR, NURSE, RECEPTIONIST)
  - `Role` : Énumération des rôles

#### 2. **Urgences Service** (Port 8082)
- **Description** : Gestion des urgences et du triage
- **Base de données** : H2 (en mémoire)
- **Entités** :
  - `Urgence` : Cas d'urgence avec priorité et statut
  - `Priority` : Énumération des priorités (LOW, MEDIUM, HIGH, CRITICAL)
  - `Status` : Énumération des statuts (WAITING, TRIAGED, IN_TREATMENT, DISCHARGED, TRANSFERRED)

## 🚀 Technologies Utilisées
- **Framework** : Spring Boot 3.5.7
- **Java** : Version 17
- **Bases de données** : PostgreSQL, H2
- **Architecture** : Microservices
- **Build Tool** : Maven

## 📋 Fonctionnalités

### User Service
- CRUD complet des utilisateurs
- Gestion des rôles et permissions
- Recherche par nom, rôle, statut
- Activation/Désactivation des comptes

### Urgences Service
- Gestion des cas d'urgence
- Système de triage par priorité
- Suivi du workflow hospitalier
- Assignation aux médecins
- Gestion des salles

## 🛠️ Installation et Démarrage

### Prérequis
- Java 17+
- Maven 3.6+
- PostgreSQL (pour User Service)

### Démarrage des Services

#### User Service
```bash
cd user
mvn spring-boot:run
```
Accessible sur : http://localhost:8081

#### Urgences Service
```bash
cd urgences
mvn spring-boot:run
```
Accessible sur : http://localhost:8082

## 📡 API Endpoints

### User Service (http://localhost:8081/api/users)
- `GET /` - Liste tous les utilisateurs
- `GET /{id}` - Utilisateur par ID
- `GET /role/{role}` - Utilisateurs par rôle
- `POST /` - Créer un utilisateur
- `PUT /{id}` - Modifier un utilisateur
- `DELETE /{id}` - Supprimer un utilisateur

### Urgences Service (http://localhost:8082/api/urgences)
- `GET /` - Liste toutes les urgences
- `GET /pending` - Urgences en attente (triées par priorité)
- `POST /` - Créer une urgence
- `PUT /{id}/triage` - Effectuer le triage
- `PUT /{id}/start-treatment` - Commencer le traitement
- `PUT /{id}/discharge` - Sortie du patient

## 👥 Auteur
Développé par Nabil dans le cadre du cours d'architecture microservices.

## 📝 Notes
Ce projet suit les bonnes pratiques d'architecture microservices avec séparation claire des responsabilités et communication via API REST.
