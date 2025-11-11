# 🚀 Configuration Rapide Keycloak - LogosTech Healthcare

## 1. 🔧 Démarrage Simple

```bash
# Exécuter le script simple
.\setup-keycloak-manual.bat
```

## 2. 🌐 Premier Accès

1. **Aller sur:** http://localhost:7070
2. **Créer admin:** 
   - Username: `admin`
   - Password: `admin`
3. **Cliquer:** "Create"

## 3. 🏥 Configuration Healthcare (5 minutes)

### Étape 1: Créer le Realm
1. **Interface admin:** http://localhost:7070/admin
2. **Se connecter:** admin/admin
3. **Dropdown "master"** → "Create Realm"
4. **Realm name:** `healthcare-realm`
5. **Create**

### Étape 2: Client Frontend (Angular)
1. **Clients** → "Create Client"
2. **Client ID:** `healthcare-frontend`
3. **Next** → **Client authentication:** OFF
4. **Next** → **Valid redirect URIs:** `http://localhost:4200/*`
5. **Save**

### Étape 3: Client Gateway (API)
1. **Clients** → "Create Client"
2. **Client ID:** `healthcare-gateway`
3. **Next** → **Client authentication:** ON
4. **Next** → **Valid redirect URIs:** `http://localhost:8070/*`
5. **Save** → Noter le **Client Secret** dans l'onglet Credentials

### Étape 4: Client User-Express
1. **Clients** → "Create Client"
2. **Client ID:** `user-express`
3. **Next** → **Client authentication:** ON
4. **Next** → **Valid redirect URIs:** `http://localhost:3000/*`
5. **Save** → Noter le **Client Secret**

### Étape 5: Créer les Rôles
**Realm roles** → "Create role" (répéter pour chaque rôle):
- `admin`
- `doctor`
- `nurse`
- `patient`
- `pharmacist`

### Étape 6: Utilisateur Admin
1. **Users** → "Create user"
2. **Username:** `admin.healthcare`
3. **Email:** `admin@logostech.com`
4. **First name:** `Admin`
5. **Last name:** `Healthcare`
6. **Email verified:** ON
7. **Create**
8. **Credentials tab** → Set password: `Admin123!` (Temporary: OFF)
9. **Role mapping tab** → Assign role: `admin`

### Étape 7: Utilisateur Docteur
1. **Users** → "Create user"
2. **Username:** `dr.martin`
3. **Email:** `dr.martin@logostech.com`
4. **First/Last name:** Martin/Dubois
5. **Credentials:** `Doctor123!`
6. **Roles:** `doctor`

## 4. 🧪 Test Rapide

### Test de Connexion
1. **Aller sur:** http://localhost:7070/realms/healthcare-realm/account
2. **Se connecter:** admin.healthcare / Admin123!
3. **Vérifier:** Accès au compte utilisateur

### Test Token JWT
```bash
curl -X POST http://localhost:7070/realms/healthcare-realm/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=healthcare-frontend&username=admin.healthcare&password=Admin123!"
```

## 5. 🔗 Configuration des Services

### User-Express (.env)
```env
KEYCLOAK_SERVER_URL=http://localhost:7070
KEYCLOAK_REALM=healthcare-realm
KEYCLOAK_CLIENT_ID=user-express
KEYCLOAK_CLIENT_SECRET=[votre-secret-du-client-user-express]
```

### API Gateway (application.properties)
```properties
spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:7070/realms/healthcare-realm
spring.security.oauth2.client.registration.keycloak.client-id=healthcare-gateway
spring.security.oauth2.client.registration.keycloak.client-secret=[votre-secret-du-client-gateway]
```

### Frontend (environment.ts)
```typescript
export const environment = {
  production: false,
  keycloakUrl: 'http://localhost:7070',
  keycloakRealm: 'healthcare-realm',
  keycloakClientId: 'healthcare-frontend'
};
```

## 6. ✅ Validation

- [ ] Keycloak démarre sur port 7070
- [ ] Realm healthcare-realm créé
- [ ] 3 clients configurés
- [ ] 5 rôles créés
- [ ] 2+ utilisateurs créés
- [ ] Test de connexion OK
- [ ] Services configurés

## 🎯 Prochaines Étapes

1. **Tester** l'intégration avec user-express
2. **Démarrer** vos microservices
3. **Tester** l'authentification frontend
4. **Ajouter** plus d'utilisateurs si nécessaire

**Configuration terminée en 5 minutes ! 🎉**
