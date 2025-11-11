# Configuration Keycloak pour LogosTech Healthcare

## 1. Installation Keycloak

### Option A: Docker (Recommandé)
```bash
# Télécharger et démarrer Keycloak
docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:latest start-dev
```

### Option B: Installation locale
1. Télécharger Keycloak depuis https://www.keycloak.org/downloads
2. Extraire dans un dossier
3. Démarrer avec:
```bash
cd keycloak-xx.x.x/bin
./kc.bat start-dev --http-port=8080
```

## 2. Accès à l'interface d'administration
- URL: http://localhost:8080/admin
- Username: admin
- Password: admin

## 3. Configuration du Realm Healthcare

### Étape 1: Créer le Realm
1. Cliquer sur "Create Realm"
2. Nom: `healthcare-realm`
3. Enabled: ON
4. Cliquer "Create"

### Étape 2: Configuration générale du Realm
- Login Theme: keycloak (ou personnalisé)
- Email Settings: Configurer SMTP si nécessaire
- Tokens:
  - Access Token Lifespan: 15 minutes
  - Refresh Token Lifespan: 30 minutes

## 4. Création des Clients

### Client 1: healthcare-gateway (API Gateway)
```json
{
  "clientId": "healthcare-gateway",
  "name": "Healthcare API Gateway",
  "protocol": "openid-connect",
  "clientAuthenticatorType": "client-secret",
  "secret": "healthcare-gateway-secret-2024",
  "standardFlowEnabled": true,
  "serviceAccountsEnabled": true,
  "authorizationServicesEnabled": true,
  "redirectUris": [
    "http://localhost:8070/*",
    "http://localhost:8070/login/oauth2/code/keycloak"
  ],
  "webOrigins": [
    "http://localhost:8070",
    "http://localhost:4200"
  ],
  "attributes": {
    "access.token.lifespan": "900",
    "client.secret.creation.time": "1699689600"
  }
}
```

### Client 2: healthcare-frontend (Angular)
```json
{
  "clientId": "healthcare-frontend",
  "name": "Healthcare Frontend Angular",
  "protocol": "openid-connect",
  "publicClient": true,
  "standardFlowEnabled": true,
  "implicitFlowEnabled": false,
  "directAccessGrantsEnabled": true,
  "redirectUris": [
    "http://localhost:4200/*",
    "http://localhost:4200/auth/callback"
  ],
  "webOrigins": [
    "http://localhost:4200"
  ],
  "attributes": {
    "pkce.code.challenge.method": "S256"
  }
}
```

### Client 3: user-express (Node.js Service)
```json
{
  "clientId": "user-express",
  "name": "User Express Service",
  "protocol": "openid-connect",
  "clientAuthenticatorType": "client-secret",
  "secret": "user-express-secret-2024",
  "serviceAccountsEnabled": true,
  "authorizationServicesEnabled": false,
  "redirectUris": [
    "http://localhost:3000/*",
    "http://localhost:3000/auth/google/callback"
  ],
  "webOrigins": [
    "http://localhost:3000"
  ]
}
```

## 5. Création des Rôles

### Rôles Realm (Globaux)
```json
[
  {
    "name": "admin",
    "description": "Administrateur système - Accès complet"
  },
  {
    "name": "doctor",
    "description": "Médecin - Accès aux patients et traitements"
  },
  {
    "name": "nurse",
    "description": "Infirmier - Assistance médicale"
  },
  {
    "name": "patient",
    "description": "Patient - Accès à son dossier médical"
  },
  {
    "name": "pharmacist",
    "description": "Pharmacien - Gestion des médicaments"
  },
  {
    "name": "insurance_agent",
    "description": "Agent d'assurance - Gestion des remboursements"
  },
  {
    "name": "hospital_admin",
    "description": "Administrateur hospitalier"
  },
  {
    "name": "emergency_staff",
    "description": "Personnel d'urgence"
  }
]
```

## 6. Utilisateurs de Test

### Admin Principal
- Username: `admin.healthcare`
- Email: `admin@logostech.com`
- Password: `Admin123!`
- Rôles: `admin`, `hospital_admin`

### Docteur Test
- Username: `dr.martin`
- Email: `dr.martin@logostech.com`
- Password: `Doctor123!`
- Rôles: `doctor`, `emergency_staff`

### Infirmier Test
- Username: `nurse.sophie`
- Email: `nurse.sophie@logostech.com`
- Password: `Nurse123!`
- Rôles: `nurse`, `emergency_staff`

### Patient Test
- Username: `patient.jean`
- Email: `patient.jean@gmail.com`
- Password: `Patient123!`
- Rôles: `patient`

### Pharmacien Test
- Username: `pharma.marie`
- Email: `pharma.marie@logostech.com`
- Password: `Pharma123!`
- Rôles: `pharmacist`

## 7. Configuration des Attributs Utilisateur

### Attributs Personnalisés
- `photoUrl`: URL de la photo de profil
- `speciality`: Spécialité médicale (pour doctors)
- `department`: Département hospitalier
- `phone`: Numéro de téléphone
- `license_number`: Numéro de licence (pour doctors/pharmacists)

## 8. Mappers de Token

### Mapper pour les Rôles
```json
{
  "name": "realm roles",
  "protocol": "openid-connect",
  "protocolMapper": "oidc-usermodel-realm-role-mapper",
  "config": {
    "claim.name": "realm_access.roles",
    "jsonType.label": "String",
    "multivalued": "true",
    "userinfo.token.claim": "true",
    "id.token.claim": "true",
    "access.token.claim": "true"
  }
}
```

### Mapper pour les Attributs
```json
{
  "name": "user attributes",
  "protocol": "openid-connect",
  "protocolMapper": "oidc-usermodel-attribute-mapper",
  "config": {
    "claim.name": "user_attributes",
    "jsonType.label": "String",
    "user.attribute": "photoUrl",
    "userinfo.token.claim": "true",
    "id.token.claim": "true",
    "access.token.claim": "true"
  }
}
```

## 9. Configuration CORS

### Realm Settings > Security Defenses
- CORS: Enabled
- Allowed Origins: 
  - http://localhost:4200
  - http://localhost:8070
  - http://localhost:3000

## 10. Configuration Email (Optionnel)

### SMTP Settings
```json
{
  "host": "smtp.gmail.com",
  "port": "587",
  "from": "noreply@logostech.com",
  "fromDisplayName": "LogosTech Healthcare",
  "ssl": false,
  "starttls": true,
  "auth": true,
  "user": "your-email@gmail.com",
  "password": "your-app-password"
}
```

## 11. Export/Import Configuration

### Export du Realm (Sauvegarde)
```bash
# Via Admin CLI
./kcadm.sh config credentials --server http://localhost:8080/auth --realm master --user admin
./kcadm.sh get realms/healthcare-realm > healthcare-realm-export.json
```

### Import du Realm
```bash
# Via fichier JSON lors du démarrage
docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin -v ./healthcare-realm-export.json:/opt/keycloak/data/import/realm.json quay.io/keycloak/keycloak:latest start-dev --import-realm
```
