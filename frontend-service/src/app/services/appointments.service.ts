import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Appointment, AppointmentStatus } from '../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentsService {
  private base = `${environment.apiGatewayUrl}/api/appointments`;

  constructor(private http: HttpClient) {}

  ping(): Observable<string> {
    return this.http.get(`${this.base}/ping`, { responseType: 'text' });
  }

  create(appt: Appointment): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.base}`, appt);
  }

  findAll(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.base}`);
  }

  findById(id: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.base}/${id}`);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  update(id: number, partial: Partial<Appointment>): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.base}/${id}`, partial);
  }

  changeStatus(id: number, status: AppointmentStatus): Observable<void> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<void>(`${this.base}/${id}/status`, null, { params });
  }

  byDoctor(doctorId: number, page=0, size=10) {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Appointment[]>(`${this.base}/by-doctor/${doctorId}`, { params });
  }

  byDoctorInRange(doctorId: number, fromIso: string, toIso: string, page=0, size=10) {
    const params = new HttpParams()
      .set('from', fromIso).set('to', toIso)
      .set('page', page).set('size', size);
    return this.http.get<Appointment[]>(`${this.base}/by-doctor/${doctorId}/range`, { params });
  }
}
