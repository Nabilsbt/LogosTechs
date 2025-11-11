import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Pharmacie } from '../models/pharmacie.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PharmacieService {
  // Use API Gateway URL
  private readonly baseUrl = `${environment.apiGatewayUrl}/api/pharmacies`;

  constructor(private http: HttpClient) {}

  // Récupère toutes les pharmacies
  getAllPharmacies(): Observable<Pharmacie[]> {
    return this.http.get<Pharmacie[]>(this.baseUrl);
  }

  // Récupère une pharmacie par ID
  getPharmacieById(id: number): Observable<Pharmacie> {
    return this.http.get<Pharmacie>(`${this.baseUrl}/${id}`);
  }

  // Crée une nouvelle pharmacie
  createPharmacie(payload: Pharmacie): Observable<Pharmacie> {
    return this.http.post<Pharmacie>(this.baseUrl, payload);
  }

  // Met à jour une pharmacie existante
  updatePharmacie(id: number, payload: Pharmacie): Observable<Pharmacie> {
    if (!id) {
      return new Observable(observer => {
        observer.error(new Error('ID de pharmacie invalide'));
      });
    }
    return this.http.put<Pharmacie>(`${this.baseUrl}/${id}`, payload);
  }

  // Supprime une pharmacie
  deletePharmacie(id: number): Observable<void> {
    const url = `${this.baseUrl}/${id}`;
    console.log('URL de suppression:', url);
    return this.http.delete<void>(url);
  }
}
