# Frontend Service - LogosTech Hospital Management

## 🅰️ Description
Interface utilisateur Angular 16 pour l'architecture microservices LogosTech de gestion hospitalière.

## 🏗️ Architecture
- **Framework**: Angular 16
- **UI Framework**: Bootstrap 5.3
- **Icons**: Font Awesome 6.0
- **Port**: 4200 (développement)

## 🚀 Fonctionnalités

### 👥 Gestion des Utilisateurs
- Liste complète des utilisateurs (médecins, infirmières, réceptionnistes, admin)
- Création, modification, suppression d'utilisateurs
- Filtrage par rôle et statut
- Recherche par nom, email, username
- Activation/désactivation des comptes

### 🚨 Gestion des Urgences
- Liste des urgences avec priorités visuelles
- Création de nouvelles urgences
- Système de triage avec assignation de médecins
- Gestion du workflow : Attente → Triage → Traitement → Sortie
- Filtrage par statut et priorité
- Recherche par patient

## 📡 Communication avec les Microservices

### Services Backend
- **User Service (PHP)**: http://localhost:8081
- **Urgences Service (Java)**: http://localhost:8082
- **Config Server**: http://localhost:8888
- **Eureka Server**: http://localhost:8761
- **API Gateway**: http://localhost:8080

### APIs Utilisées
- `GET /api/users` - Liste des utilisateurs
- `POST /api/users` - Création d'utilisateur
- `PUT /api/users/{id}` - Modification d'utilisateur
- `GET /api/urgences` - Liste des urgences
- `POST /api/urgences` - Création d'urgence
- `PUT /api/urgences/{id}/triage` - Triage d'urgence

## 🛠️ Installation et Démarrage

### Prérequis
- Node.js 16+
- Angular CLI 16
- npm ou yarn

### Installation
```bash
cd frontend-service
npm install
```

### Démarrage en développement
```bash
ng serve
# ou
npm start
```
L'application sera accessible sur http://localhost:4200

### Build de production
```bash
ng build --prod
```

## 📁 Structure du Projet
```
frontend-service/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── users/           # Gestion des utilisateurs
│   │   │   ├── urgences/        # Gestion des urgences
│   │   │   └── shared/          # Composants partagés
│   │   ├── services/            # Services Angular
│   │   ├── models/              # Interfaces TypeScript
│   │   └── environments/        # Configuration environnements
│   ├── assets/                  # Ressources statiques
│   └── index.html              # Point d'entrée
├── package.json                # Dépendances
└── angular.json               # Configuration Angular
```

## 🎨 Interface Utilisateur

### Navigation
- **Navbar** avec navigation entre modules
- **Routing** automatique vers les composants
- **Responsive design** avec Bootstrap

### Composants Principaux
- **UserListComponent**: Gestion complète des utilisateurs
- **UrgenceListComponent**: Gestion des urgences et triage
- **Modals Bootstrap**: Création et édition d'entités

### Thème et Design
- **Bootstrap 5.3** pour le design système
- **Font Awesome 6.0** pour les icônes
- **Couleurs thématiques** selon les priorités/rôles
- **Interface responsive** pour mobile et desktop

## 🔧 Configuration

### Environnements
```typescript
// environment.ts (développement)
export const environment = {
  production: false,
  userServiceUrl: 'http://localhost:8081',
  urgenceServiceUrl: 'http://localhost:8082'
};

// environment.prod.ts (production)
export const environment = {
  production: true,
  userServiceUrl: 'http://production-user-service:8081',
  urgenceServiceUrl: 'http://production-urgence-service:8082'
};
```

### Modules Angular
- **FormsModule**: Pour les formulaires template-driven
- **HttpClientModule**: Pour les appels API REST
- **RouterModule**: Pour la navigation
- **CommonModule**: Pour les pipes et directives

## 🧪 Tests et Développement

### Commandes utiles
```bash
# Tests unitaires
ng test

# Linting
ng lint

# Génération de composants
ng generate component components/nouveau-composant

# Génération de services
ng generate service services/nouveau-service
```

### Développement
- **Hot reload** activé en mode développement
- **Source maps** pour le debugging
- **Proxy configuration** pour éviter les problèmes CORS

## 🚀 Déploiement

### Build optimisé
```bash
ng build --configuration production
```

### Docker (optionnel)
```dockerfile
FROM node:16-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN ng build --prod

FROM nginx:alpine
COPY --from=build /app/dist/frontend-service /usr/share/nginx/html
EXPOSE 80
```

## 🔗 Intégration Microservices
Ce frontend s'intègre parfaitement avec :
- **User Service PHP** (Port 8081)
- **Urgences Service Java** (Port 8082)
- **Infrastructure services** (Config, Eureka, Gateway)

## 📊 Fonctionnalités Avancées
- **Gestion d'erreurs** centralisée
- **Loading states** pour toutes les opérations
- **Validation de formulaires** côté client
- **Filtrage et recherche** en temps réel
- **Modals Bootstrap** pour les interactions
- **Responsive design** adaptatif
