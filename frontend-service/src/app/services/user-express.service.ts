import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { 
  KeycloakUser, 
  UserProfile, 
  CreateUserRequest, 
  UpdateUserRequest, 
  LoginRequest, 
  LoginResponse,
  ApiResponse,
  Review,
  Appointment
} from '../models/user-express.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserExpressService {
  private readonly baseUrl = `${environment.userServiceUrl}`;

  constructor(private http: HttpClient) {}

  // ========================================
  // Authentication Endpoints
  // ========================================

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials);
  }

  logout(): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/api/logout`, {});
  }

  createUser(user: CreateUserRequest, photo?: File): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('username', user.username);
    formData.append('email', user.email);
    formData.append('password', user.password);
    formData.append('firstName', user.firstName);
    formData.append('lastName', user.lastName);
    if (user.role) {
      formData.append('role', user.role);
    }
    if (photo) {
      formData.append('photo', photo);
    }

    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/create-user`, formData);
  }

  // ========================================
  // User Profile Endpoints
  // ========================================

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/profile`);
  }

  updateProfile(profile: UpdateUserRequest, photo?: File): Observable<ApiResponse<any>> {
    const formData = new FormData();
    if (profile.firstName) formData.append('firstName', profile.firstName);
    if (profile.lastName) formData.append('lastName', profile.lastName);
    if (profile.email) formData.append('email', profile.email);
    if (photo) formData.append('photo', photo);

    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/profile`, formData);
  }

  // ========================================
  // Admin User Management Endpoints
  // ========================================

  getAllUsers(): Observable<KeycloakUser[]> {
    return this.http.get<KeycloakUser[]>(`${this.baseUrl}/users`).pipe(
      map((users: KeycloakUser[]) => users.map(user => this.transformKeycloakUser(user)))
    );
  }

  getUserById(id: string): Observable<KeycloakUser> {
    return this.http.get<KeycloakUser>(`${this.baseUrl}/users/${id}`);
  }

  updateUser(id: string, user: UpdateUserRequest, photo?: File): Observable<ApiResponse<any>> {
    const formData = new FormData();
    if (user.username) formData.append('username', user.username);
    if (user.email) formData.append('email', user.email);
    if (user.firstName) formData.append('firstName', user.firstName);
    if (user.lastName) formData.append('lastName', user.lastName);
    if (user.enabled !== undefined) formData.append('enabled', user.enabled.toString());
    if (photo) formData.append('photo', photo);

    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/users/${id}`, formData);
  }

  deleteUser(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/users/${id}`);
  }

  assignRole(userId: string, roleName: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/users/${userId}/roles`, { roleName });
  }

  removeRole(userId: string, roleName: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/users/${userId}/roles/${roleName}`);
  }

  resetPassword(userId: string, newPassword: string, temporary: boolean = false): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/users/${userId}/reset-password`, {
      newPassword,
      temporary
    });
  }

  // ========================================
  // Service-to-Service Communication
  // ========================================

  getUserInfo(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/users/${id}/info`);
  }

  // ========================================
  // Reviews Management
  // ========================================

  addReview(review: Partial<Review>): Observable<ApiResponse<Review>> {
    return this.http.post<ApiResponse<Review>>(`${this.baseUrl}/reviews`, review);
  }

  getReviewsByDoctor(doctorId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/reviews/doctor/${doctorId}`);
  }

  getDoctorAverageRating(doctorId: string): Observable<{ averageRating: number; totalReviews: number }> {
    return this.http.get<{ averageRating: number; totalReviews: number }>(`${this.baseUrl}/reviews/doctor/${doctorId}/average`);
  }

  getMyReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/reviews/my-reviews`);
  }

  deleteReview(reviewId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/reviews/${reviewId}`);
  }

  // ========================================
  // Appointments Management
  // ========================================

  createAppointment(appointment: Partial<Appointment>): Observable<ApiResponse<Appointment>> {
    return this.http.post<ApiResponse<Appointment>>(`${this.baseUrl}/appointments`, appointment);
  }

  getMyAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/appointments/my-appointments`);
  }

  updateAppointmentStatus(appointmentId: string, status: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/appointments/${appointmentId}/status`, { status });
  }

  deleteAppointment(appointmentId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/appointments/${appointmentId}`);
  }

  // ========================================
  // Password Management
  // ========================================

  forgotPassword(email: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/forgot-password`, { email });
  }

  resetPasswordWithToken(token: string, newPassword: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/reset-password`, { token, newPassword });
  }

  verifyResetToken(token: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/verify-reset-token`, { token });
  }

  // ========================================
  // Utility Methods
  // ========================================

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  private transformKeycloakUser(user: KeycloakUser): KeycloakUser {
    // Extraire les attributs personnalisés de Keycloak
    const transformed = { ...user };
    
    if (user.attributes) {
      // Keycloak stocke les attributs comme des tableaux de strings
      transformed.speciality = user.attributes['speciality']?.[0];
      transformed.department = user.attributes['department']?.[0];
      transformed.phone = user.attributes['phone']?.[0];
      transformed.licenseNumber = user.attributes['license_number']?.[0];
    }
    
    return transformed;
  }

  // ========================================
  // Google OAuth
  // ========================================

  getGoogleAuthUrl(): string {
    return `${this.baseUrl}/auth/google`;
  }

  getGoogleUser(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/auth/google/user`);
  }

  googleLogout(): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/auth/google/logout`, {});
  }
}
