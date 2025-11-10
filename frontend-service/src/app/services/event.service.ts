import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EventEntity } from '../models/event.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  // Utilise une URL relative pour profiter du proxy Angular en dev
  private readonly baseUrl = `/api/events`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<EventEntity[]> {
    return this.http.get<EventEntity[]>(this.baseUrl);
    }

  getById(id: number): Observable<EventEntity> {
    return this.http.get<EventEntity>(`${this.baseUrl}/${id}`);
  }

  create(payload: EventEntity): Observable<EventEntity> {
    return this.http.post<EventEntity>(this.baseUrl, payload);
  }

  update(id: number, payload: EventEntity): Observable<EventEntity> {
    return this.http.put<EventEntity>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}


