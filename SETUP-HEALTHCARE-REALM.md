# 🏥 Configuration Realm Healthcare - Guide Personnalisé

## 📍 Votre Situation Actuelle
- ✅ Keycloak démarré sur http://localhost:7070
- ✅ Connecté avec : `ibtissem` / `ibtissem`
- ✅ Dans le realm "master"

## 🎯 Étapes à Suivre

### Étape 1: Créer le Realm Healthcare
1. **Cliquer sur "master"** (dropdown en haut à gauche)
2. **"Create Realm"**
3. **Realm name:** `healthcare-realm`
4. **"Create"**

### Étape 2: Configurer les Clients

#### Client 1: Frontend Angular
1. **Clients** → **"Create Client"**
2. **Client ID:** `healthcare-frontend`
3. **Client type:** OpenID Connect
4. **"Next"**
5. **Client authentication:** OFF (Public client)
6. **"Next"**
7. **Valid redirect URIs:** `http://localhost:4200/*`
8. **Web origins:** `http://localhost:4200`
9. **"Save"**

#### Client 2: API Gateway
1. **Clients** → **"Create Client"**
2. **Client ID:** `healthcare-gateway`
3. **"Next"**
4. **Client authentication:** ON (Confidential)
5. **Authorization:** ON
6. **"Next"**
7. **Valid redirect URIs:** `http://localhost:8070/*`
8. **Web origins:** `http://localhost:8070`
9. **"Save"**
10. **Aller dans l'onglet "Credentials"**
11. **Noter le Client Secret** (vous en aurez besoin)

#### Client 3: User Express Service
1. **Clients** → **"Create Client"**
2. **Client ID:** `user-express`
3. **"Next"**
4. **Client authentication:** ON (Confidential)
5. **Service accounts:** ON
6. **"Next"**
7. **Valid redirect URIs:** `http://localhost:3000/*`
8. **"Save"**
9. **Noter le Client Secret**

### Étape 3: Créer les Rôles

**Realm roles** → **"Create role"** (répéter pour chaque rôle):

1. **admin** - Administrateur système
2. **doctor** - Médecin
3. **nurse** - Infirmier
4. **patient** - Patient
5. **pharmacist** - Pharmacien
6. **insurance_agent** - Agent d'assurance
7. **hospital_admin** - Admin hôpital
8. **emergency_staff** - Personnel urgences

### Étape 4: Créer les Utilisateurs

#### Utilisateur Admin
1. **Users** → **"Create user"**
2. **Username:** `admin.healthcare`
3. **Email:** `admin@logostech.com`
4. **First name:** `Admin`
5. **Last name:** `Healthcare`
6. **Email verified:** ON
7. **Enabled:** ON
8. **"Create"**
9. **Onglet "Credentials":**
   - **Password:** `Admin123!`
   - **Temporary:** OFF
   - **"Set password"**
10. **Onglet "Role mapping":**
    - **"Assign role"**
    - **Sélectionner:** `admin`
    - **"Assign"**

#### Utilisateur Docteur (Optionnel)
1. **Users** → **"Create user"**
2. **Username:** `dr.martin`
3. **Email:** `dr.martin@logostech.com`
4. **First name:** `Martin`
5. **Last name:** `Dubois`
6. **Credentials:** `Doctor123!`
7. **Roles:** `doctor`

### Étape 5: Configuration des Mappers (Important!)

Pour chaque client, ajouter les mappers de rôles :

1. **Clients** → **Sélectionner un client** → **"Client scopes"**
2. **Cliquer sur le scope dédié** (ex: healthcare-frontend-dedicated)
3. **"Add mapper"** → **"By configuration"**
4. **"User Realm Role"**
5. **Configuration:**
   - **Name:** `realm-roles`
   - **Token Claim Name:** `realm_access.roles`
   - **Claim JSON Type:** String
   - **Add to ID token:** ON
   - **Add to access token:** ON
   - **Add to userinfo:** ON
6. **"Save"**

**Répéter pour tous les clients !**

### Étape 6: Test de Configuration

#### Test 1: Connexion Utilisateur
1. **Aller sur:** http://localhost:7070/realms/healthcare-realm/account
2. **Se connecter avec:** `admin.healthcare` / `Admin123!`
3. **Vérifier l'accès**

#### Test 2: Token JWT
```bash
curl -X POST http://localhost:7070/realms/healthcare-realm/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=healthcare-frontend&username=admin.healthcare&password=Admin123!"
```

## 🔧 Configuration des Services

### 1. User-Express (.env)
Copier `.env.example` vers `.env` et mettre à jour :
```env
KEYCLOAK_SERVER_URL=http://localhost:7070
KEYCLOAK_REALM=healthcare-realm
KEYCLOAK_CLIENT_ID=user-express
KEYCLOAK_CLIENT_SECRET=[votre-secret-du-client-user-express]
KEYCLOAK_ADMIN_USERNAME=ibtissem
KEYCLOAK_ADMIN_PASSWORD=ibtissem
```

### 2. API Gateway
Mettre à jour le client secret dans `application.properties` :
```properties
spring.security.oauth2.client.registration.keycloak.client-secret=[votre-secret-du-client-gateway]
```

## ✅ Checklist de Validation

- [ ] Realm `healthcare-realm` créé
- [ ] 3 clients configurés avec secrets notés
- [ ] 8 rôles créés
- [ ] Utilisateur admin créé et testé
- [ ] Mappers de rôles configurés pour tous les clients
- [ ] Test de connexion réussi
- [ ] Variables d'environnement mises à jour

## 🎯 Prochaines Étapes

1. **Terminer la configuration** Keycloak
2. **Copier les secrets** des clients dans vos services
3. **Démarrer user-express** avec les nouvelles variables
4. **Tester l'intégration** complète

**Votre Keycloak sera prêt pour l'intégration ! 🎉**
