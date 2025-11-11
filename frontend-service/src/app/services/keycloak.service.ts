import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

declare let Keycloak: any;

@Injectable({
  providedIn: 'root'
})
export class KeycloakService {
  private keycloakAuth: any;

  constructor() {}

  init(): Promise<any> {
    return new Promise((resolve, reject) => {
      const config = {
        url: environment.keycloakUrl,
        realm: environment.keycloakRealm,
        clientId: environment.keycloakClientId
      };

      this.keycloakAuth = new Keycloak(config);

      this.keycloakAuth.init({
        onLoad: 'login-required',
        checkLoginIframe: false
      })
      .then((authenticated: boolean) => {
        if (authenticated) {
          resolve(this.keycloakAuth);
        } else {
          reject('Not authenticated');
        }
      })
      .catch((error: any) => {
        reject('Keycloak initialization failed: ' + error);
      });
    });
  }

  getToken(): string {
    return this.keycloakAuth?.token;
  }

  getKeycloakAuth(): any {
    return this.keycloakAuth;
  }

  getUsername(): string {
    return this.keycloakAuth?.tokenParsed?.preferred_username;
  }

  getRoles(): string[] {
    return this.keycloakAuth?.tokenParsed?.realm_access?.roles || [];
  }

  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }

  logout(): void {
    this.keycloakAuth?.logout({
      redirectUri: window.location.origin
    });
  }

  login(): void {
    this.keycloakAuth?.login();
  }

  isAuthenticated(): boolean {
    return this.keycloakAuth?.authenticated || false;
  }

  updateToken(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.keycloakAuth.updateToken(30)
        .then((refreshed: boolean) => {
          resolve(refreshed);
        })
        .catch((error: any) => {
          reject(error);
        });
    });
  }
}
