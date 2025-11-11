import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Appointment, AppointmentStatus } from '../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentsService {
  private base = `${environment.apiGatewayUrl}/appointments`;

  constructor(private http: HttpClient) {}

  ping(): Observable<string> {
    return this.http.get(`${this.base}/ping`, { responseType: 'text' });
  }
  create(dto: any) {
    return this.http.post(`${environment.apiGatewayUrl}/appointments`, dto);
  }
  list(page=0,size=20){
    return this.http.get(`${environment.apiGatewayUrl}/appointments?page=${page}&size=${size}`);
  }
  get(id:number){
    return this.http.get(`${environment.apiGatewayUrl}/appointments/${id}`);
  }
  update(id:number, dto:any){
    return this.http.put(`${environment.apiGatewayUrl}/appointments/${id}`, dto);
  }
  remove(id:number){
    return this.http.delete(`${environment.apiGatewayUrl}/appointments/${id}`);
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
