import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Assurance } from '../models/assurance.model';

@Injectable({
  providedIn: 'root'
})
export class AssuranceService {
  private apiUrl = 'http://localhost:8083/assurances'; // Adjust port/host if needed

  constructor(private http: HttpClient) {}

  // Get all assurances
  getAllAssurances(): Observable<Assurance[]> {
    return this.http.get<Assurance[]>(`${this.apiUrl}/all`);
  }

  // Get assurance by ID
  getAssuranceById(id: number): Observable<Assurance> {
    return this.http.get<Assurance>(`${this.apiUrl}/${id}`);
  }

  // Add new assurance
  addAssurance(assurance: Assurance): Observable<Assurance> {
    return this.http.post<Assurance>(`${this.apiUrl}/add`, assurance);
  }

  // Update assurance
  updateAssurance(id: number, assurance: Assurance): Observable<Assurance> {
    return this.http.put<Assurance>(`${this.apiUrl}/update/${id}`, assurance);
  }

  // Delete assurance
  deleteAssurance(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}
