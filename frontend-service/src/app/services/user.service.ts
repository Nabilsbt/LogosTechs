import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserRole, CreateUserRequest, UpdateUserRequest, ApiResponse } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly baseUrl = `${environment.userServiceUrl}/api/users`;

  constructor(private http: HttpClient) {}

  // GET endpoints
  getAllUsers(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(this.baseUrl);
  }

  getUserById(id: number): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/${id}`);
  }

  getUserByUsername(username: string): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/username/${username}`);
  }

  getUsersByRole(role: UserRole): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${this.baseUrl}/role/${role}`);
  }

  getActiveUsers(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${this.baseUrl}/active`);
  }

  searchUsersByName(name: string): Observable<ApiResponse<User[]>> {
    const params = new HttpParams().set('name', name);
    return this.http.get<ApiResponse<User[]>>(`${this.baseUrl}/search`, { params });
  }

  countUsersByRole(role: UserRole): Observable<ApiResponse<{role: string, count: number}>> {
    return this.http.get<ApiResponse<{role: string, count: number}>>(`${this.baseUrl}/count/role/${role}`);
  }

  // POST endpoints
  createUser(user: CreateUserRequest): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(this.baseUrl, user);
  }

  // PUT endpoints
  updateUser(id: number, user: UpdateUserRequest): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.baseUrl}/${id}`, user);
  }

  activateUser(id: number): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.baseUrl}/${id}/activate`, {});
  }

  deactivateUser(id: number): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  // DELETE endpoints
  deleteUser(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  // Utility methods
  getRoleLabel(role: UserRole): string {
    const roleLabels = {
      [UserRole.ADMIN]: 'Administrateur',
      [UserRole.DOCTOR]: 'Médecin',
      [UserRole.NURSE]: 'Infirmière',
      [UserRole.RECEPTIONIST]: 'Réceptionniste'
    };
    return roleLabels[role] || role;
  }

  getRoleColor(role: UserRole): string {
    const roleColors = {
      [UserRole.ADMIN]: 'danger',
      [UserRole.DOCTOR]: 'primary',
      [UserRole.NURSE]: 'success',
      [UserRole.RECEPTIONIST]: 'info'
    };
    return roleColors[role] || 'secondary';
  }
}
