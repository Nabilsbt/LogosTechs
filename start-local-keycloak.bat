@echo off
echo ========================================
echo   LogosTech Healthcare - Keycloak Local
echo ========================================

echo.
echo 1. Demarrage de Keycloak local...
echo.

REM Aller dans le dossier Keycloak
cd /d "C:\Users\Nabil\Downloads\wetransfer_keycloak-26-4-2_2025-11-11_0245\keycloak-26.4.2\keycloak-26.4.2"

echo Repertoire actuel: %cd%
echo.

REM Démarrer Keycloak en mode développement
echo Demarrage de Keycloak sur le port 8080...
echo.

bin\kc.bat start-dev --http-port=8080

echo.
echo ========================================
echo   Keycloak demarre...
echo ========================================
echo.
echo URL Admin: http://localhost:8080/admin
echo.
echo Pour creer un admin au premier demarrage:
echo Username: admin
echo Password: admin
echo.
echo ========================================

pause
