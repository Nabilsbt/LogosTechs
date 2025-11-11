import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Hopital } from '../models/hopital.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HopitalService {
  // Use API gateway or specific service URL from environment if available
  private apiUrl = environment.apiGatewayUrl || 'http://localhost:8083';
  private basePath = `${this.apiUrl}/api/hopitaux`;

  constructor(private http: HttpClient) { }

  getAllHopitaux(): Observable<Hopital[]> {
    return this.http.get<any[]>(`${this.basePath}/all`)
      .pipe(
        map(arr => arr.map(item => ({ ...item, id: item.id ?? item.idHopital })))
      );
  }

 // hopital.service.ts
getHopitalById(id: number): Observable<Hopital> {
  return this.http.get<Hopital>(`${this.basePath}/getbyId/${id}`).pipe(
    map((data: any) => ({
      idHopital: data.idHopital,
      nom: data.nom,
      adresse: data.adresse,
      telephone: data.telephone,
      email: data.email,
      type: data.type,
      capaciteLits: data.capaciteLits
    }))
  );
}

  createHopital(hopital: Hopital): Observable<Hopital> {
    return this.http.post<Hopital>(`${this.basePath}/Add`, hopital);
  }

  updateHopital(id: number, hopital: Hopital): Observable<Hopital> {
    return this.http.put<Hopital>(`${this.basePath}/update/${id}`, hopital);
  }

  deleteHopital(id: number): Observable<void> {
    return this.http.delete<void>(`${this.basePath}/delete/${id}`);
  }

  searchHopitaux(keyword: string): Observable<Hopital[]> {
    return this.http.get<any[]>(`${this.basePath}/search?keyword=${encodeURIComponent(keyword)}`)
      .pipe(
        map(arr => arr.map(item => ({ ...item, id: item.id ?? item.idHopital })))
      );
  }
}
