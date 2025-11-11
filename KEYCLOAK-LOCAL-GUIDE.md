# 🔐 Guide Keycloak Local - LogosTech Healthcare

## 📍 Votre Installation
**Chemin:** `C:\Users\Nabil\Downloads\wetransfer_keycloak-26-4-2_2025-11-11_0245\keycloak-26.4.2\keycloak-26.4.2`

## 🚀 Étapes de Démarrage

### Étape 1: Démarrer Keycloak
```bash
# Option A: Utiliser le script
./start-local-keycloak.bat

# Option B: Commande manuelle
cd "C:\Users\Nabil\Downloads\wetransfer_keycloak-26-4-2_2025-11-11_0245\keycloak-26.4.2\keycloak-26.4.2"
bin\kc.bat start-dev --http-port=8080
```

### Étape 2: Premier Accès (Si nouveau)
1. Aller sur: http://localhost:8080
2. **Si c'est la première fois**, créer un admin:
   - Username: `admin`
   - Password: `admin` (ou votre choix)
3. Cliquer "Create"

### Étape 3: Accès à l'Administration
1. Aller sur: http://localhost:8080/admin
2. Se connecter avec vos identifiants admin

## 🏥 Configuration du Realm Healthcare

### Étape 1: Créer le Realm
1. Dans l'interface admin, cliquer sur le dropdown "master" (en haut à gauche)
2. Cliquer "Create Realm"
3. **Realm name:** `healthcare-realm`
4. Cliquer "Create"

### Étape 2: Configurer le Realm
1. **Realm Settings > General:**
   - Display name: `LogosTech Healthcare`
   - Enabled: ON
   
2. **Realm Settings > Login:**
   - User registration: ON
   - Remember me: ON
   - Login with email: ON

3. **Realm Settings > Tokens:**
   - Access token lifespan: `15 minutes`
   - Refresh token lifespan: `30 minutes`

## 👥 Création des Clients

### Client 1: healthcare-frontend (Angular)
1. **Clients > Create Client**
2. **General Settings:**
   - Client ID: `healthcare-frontend`
   - Name: `Healthcare Frontend Angular`
   - Description: `Application Angular frontend`
3. **Capability config:**
   - Client authentication: OFF (Public client)
   - Authorization: OFF
   - Standard flow: ON
   - Direct access grants: ON
4. **Login settings:**
   - Valid redirect URIs: `http://localhost:4200/*`
   - Web origins: `http://localhost:4200`

### Client 2: healthcare-gateway (API Gateway)
1. **Clients > Create Client**
2. **General Settings:**
   - Client ID: `healthcare-gateway`
   - Name: `Healthcare API Gateway`
3. **Capability config:**
   - Client authentication: ON (Confidential)
   - Authorization: ON
   - Standard flow: ON
   - Service accounts: ON
4. **Login settings:**
   - Valid redirect URIs: `http://localhost:8070/*`
   - Web origins: `http://localhost:8070`
5. **Credentials tab:**
   - Noter le Client Secret généré

### Client 3: user-express (Node.js)
1. **Clients > Create Client**
2. **General Settings:**
   - Client ID: `user-express`
   - Name: `User Express Service`
3. **Capability config:**
   - Client authentication: ON (Confidential)
   - Service accounts: ON
4. **Login settings:**
   - Valid redirect URIs: `http://localhost:3000/*`
   - Web origins: `http://localhost:3000`

## 🎭 Création des Rôles

### Realm Roles
1. **Realm roles > Create role**
2. Créer ces rôles un par un:

| Nom | Description |
|-----|-------------|
| `admin` | Administrateur système |
| `doctor` | Médecin |
| `nurse` | Infirmier |
| `patient` | Patient |
| `pharmacist` | Pharmacien |
| `insurance_agent` | Agent d'assurance |
| `hospital_admin` | Admin hôpital |
| `emergency_staff` | Personnel urgences |

## 👤 Création des Utilisateurs

### Utilisateur Admin
1. **Users > Create user**
2. **Details:**
   - Username: `admin.healthcare`
   - Email: `admin@logostech.com`
   - First name: `Admin`
   - Last name: `Healthcare`
   - Email verified: ON
   - Enabled: ON
3. **Credentials tab:**
   - Set password: `Admin123!`
   - Temporary: OFF
4. **Role mapping tab:**
   - Assign roles: `admin`, `hospital_admin`

### Utilisateur Docteur
1. **Users > Create user**
2. **Details:**
   - Username: `dr.martin`
   - Email: `dr.martin@logostech.com`
   - First name: `Martin`
   - Last name: `Dubois`
3. **Credentials:** `Doctor123!`
4. **Roles:** `doctor`, `emergency_staff`

### Utilisateur Infirmier
1. **Users > Create user**
2. **Details:**
   - Username: `nurse.sophie`
   - Email: `nurse.sophie@logostech.com`
   - First name: `Sophie`
   - Last name: `Martin`
3. **Credentials:** `Nurse123!`
4. **Roles:** `nurse`, `emergency_staff`

### Utilisateur Patient
1. **Users > Create user**
2. **Details:**
   - Username: `patient.jean`
   - Email: `patient.jean@gmail.com`
   - First name: `Jean`
   - Last name: `Dupont`
3. **Credentials:** `Patient123!`
4. **Roles:** `patient`

## 🔧 Configuration Avancée

### Mappers de Token (Important!)
Pour chaque client, ajouter les mappers:

1. **Client > Client scopes > [client-name]-dedicated**
2. **Add mapper > By configuration > User Realm Role**
3. **Configuration:**
   - Name: `realm-roles`
   - Token Claim Name: `realm_access.roles`
   - Claim JSON Type: String
   - Add to ID token: ON
   - Add to access token: ON
   - Add to userinfo: ON

## 🧪 Tests de Validation

### Test 1: Connexion Interface
1. Aller sur http://localhost:8080/realms/healthcare-realm/account
2. Se connecter avec `admin.healthcare` / `Admin123!`
3. Vérifier l'accès au compte

### Test 2: Token JWT
```bash
# Test avec curl
curl -X POST http://localhost:8080/realms/healthcare-realm/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=healthcare-frontend&username=admin.healthcare&password=Admin123!"
```

## 📊 Interface d'Administration

### Navigation Principale
- **Realm settings:** Configuration générale
- **Clients:** Applications connectées
- **Users:** Gestion des utilisateurs
- **Groups:** Groupes d'utilisateurs
- **Roles:** Rôles et permissions
- **Sessions:** Sessions actives
- **Events:** Logs et événements

### Raccourcis Utiles
- **Realm:** healthcare-realm
- **Admin Console:** http://localhost:8080/admin
- **Account Console:** http://localhost:8080/realms/healthcare-realm/account
- **OpenID Endpoint:** http://localhost:8080/realms/healthcare-realm/.well-known/openid_configuration

## 🔄 Import/Export

### Export du Realm
1. **Realm settings > Action > Partial export**
2. Sélectionner ce qu'exporter
3. Télécharger le fichier JSON

### Import via CLI
```bash
cd "C:\Users\Nabil\Downloads\wetransfer_keycloak-26-4-2_2025-11-11_0245\keycloak-26.4.2\keycloak-26.4.2"
bin\kc.bat import --file healthcare-realm-export.json
```

## 🐛 Dépannage

### Keycloak ne démarre pas
```bash
# Vérifier Java
java -version

# Nettoyer le cache
rmdir /s data\tmp
```

### Port 8080 occupé
```bash
# Changer le port
bin\kc.bat start-dev --http-port=8081
```

### Erreur de mémoire
```bash
# Augmenter la mémoire
set JAVA_OPTS=-Xms512m -Xmx2g
bin\kc.bat start-dev
```

## ✅ Checklist de Configuration

- [ ] Keycloak démarre sur http://localhost:8080
- [ ] Admin créé et connexion OK
- [ ] Realm `healthcare-realm` créé
- [ ] 3 clients configurés
- [ ] 8 rôles créés
- [ ] 4+ utilisateurs de test créés
- [ ] Mappers de rôles configurés
- [ ] Test de connexion réussi
- [ ] Token JWT généré correctement

## 🎯 Intégration avec vos Services

Une fois Keycloak configuré, mettre à jour:

1. **user-express/.env:**
```env
KEYCLOAK_SERVER_URL=http://localhost:8080
KEYCLOAK_REALM=healthcare-realm
KEYCLOAK_CLIENT_ID=user-express
KEYCLOAK_CLIENT_SECRET=[votre-secret-client]
```

2. **API Gateway application.properties:**
```properties
spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:8080/realms/healthcare-realm
```

3. **Frontend environment.ts:**
```typescript
keycloakUrl: 'http://localhost:8080',
keycloakRealm: 'healthcare-realm',
keycloakClientId: 'healthcare-frontend'
```
