import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Urgence, Priority, UrgenceStatus, CreateUrgenceRequest, UpdateUrgenceRequest, TriageRequest, TreatmentRequest } from '../models/urgence.model';
import { ApiResponse } from '../models/common.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UrgenceService {
  private readonly baseUrl = `${environment.urgenceServiceUrl}/api/urgences`;

  constructor(private http: HttpClient) {}

  // GET endpoints
  getAllUrgences(): Observable<ApiResponse<Urgence[]>> {
    return this.http.get<ApiResponse<Urgence[]>>(this.baseUrl);
  }

  getUrgenceById(id: number): Observable<ApiResponse<Urgence>> {
    return this.http.get<ApiResponse<Urgence>>(`${this.baseUrl}/${id}`);
  }

  getUrgencesByStatus(status: UrgenceStatus): Observable<ApiResponse<Urgence[]>> {
    return this.http.get<ApiResponse<Urgence[]>>(`${this.baseUrl}/status/${status}`);
  }

  getUrgencesByPriority(priority: Priority): Observable<ApiResponse<Urgence[]>> {
    return this.http.get<ApiResponse<Urgence[]>>(`${this.baseUrl}/priority/${priority}`);
  }

  getUrgencesByDoctor(doctorId: number): Observable<ApiResponse<Urgence[]>> {
    return this.http.get<ApiResponse<Urgence[]>>(`${this.baseUrl}/doctor/${doctorId}`);
  }

  getPendingUrgences(): Observable<ApiResponse<Urgence[]>> {
    return this.http.get<ApiResponse<Urgence[]>>(`${this.baseUrl}/pending`);
  }

  searchUrgencesByPatientName(name: string): Observable<ApiResponse<Urgence[]>> {
    const params = new HttpParams().set('name', name);
    return this.http.get<ApiResponse<Urgence[]>>(`${this.baseUrl}/search`, { params });
  }

  getUrgencesByDateRange(startDate: string, endDate: string): Observable<ApiResponse<Urgence[]>> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<ApiResponse<Urgence[]>>(`${this.baseUrl}/date-range`, { params });
  }

  countUrgencesByStatus(status: UrgenceStatus): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.baseUrl}/count/status/${status}`);
  }

  // POST endpoints
  createUrgence(urgence: CreateUrgenceRequest): Observable<ApiResponse<Urgence>> {
    return this.http.post<ApiResponse<Urgence>>(this.baseUrl, urgence);
  }

  // PUT endpoints
  updateUrgence(id: number, urgence: UpdateUrgenceRequest): Observable<ApiResponse<Urgence>> {
    return this.http.put<ApiResponse<Urgence>>(`${this.baseUrl}/${id}`, urgence);
  }

  triageUrgence(id: number, request: TriageRequest): Observable<ApiResponse<Urgence>> {
    const params = new HttpParams()
      .set('priority', request.priority)
      .set('doctorId', request.doctorId.toString());
    return this.http.put<ApiResponse<Urgence>>(`${this.baseUrl}/${id}/triage`, {}, { params });
  }

  startTreatment(id: number, request: TreatmentRequest): Observable<ApiResponse<Urgence>> {
    const params = new HttpParams().set('roomNumber', request.roomNumber);
    return this.http.put<ApiResponse<Urgence>>(`${this.baseUrl}/${id}/start-treatment`, {}, { params });
  }

  dischargePatient(id: number): Observable<ApiResponse<Urgence>> {
    return this.http.put<ApiResponse<Urgence>>(`${this.baseUrl}/${id}/discharge`, {});
  }

  // DELETE endpoints
  deleteUrgence(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  // Utility methods
  getPriorityLabel(priority: Priority): string {
    const priorityLabels = {
      [Priority.LOW]: 'Faible',
      [Priority.MEDIUM]: 'Moyenne',
      [Priority.HIGH]: 'Élevée',
      [Priority.CRITICAL]: 'Critique'
    };
    return priorityLabels[priority] || priority;
  }

  getPriorityColor(priority: Priority): string {
    const priorityColors = {
      [Priority.LOW]: 'success',
      [Priority.MEDIUM]: 'warning',
      [Priority.HIGH]: 'danger',
      [Priority.CRITICAL]: 'dark'
    };
    return priorityColors[priority] || 'secondary';
  }

  getStatusLabel(status: UrgenceStatus): string {
    const statusLabels = {
      [UrgenceStatus.WAITING]: 'En attente',
      [UrgenceStatus.TRIAGED]: 'Triée',
      [UrgenceStatus.IN_TREATMENT]: 'En traitement',
      [UrgenceStatus.DISCHARGED]: 'Sortie',
      [UrgenceStatus.TRANSFERRED]: 'Transférée'
    };
    return statusLabels[status] || status;
  }

  getStatusColor(status: UrgenceStatus): string {
    const statusColors = {
      [UrgenceStatus.WAITING]: 'warning',
      [UrgenceStatus.TRIAGED]: 'info',
      [UrgenceStatus.IN_TREATMENT]: 'primary',
      [UrgenceStatus.DISCHARGED]: 'success',
      [UrgenceStatus.TRANSFERRED]: 'secondary'
    };
    return statusColors[status] || 'secondary';
  }
}
