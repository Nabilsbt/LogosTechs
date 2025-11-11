// src/app/models/hopital.model.ts
export interface Hopital {
  // unify backend "idHopital" with frontend-friendly "id"
  id?: number;
  idHopital?: number;
  nom: string;
  adresse: string;
  telephone: string;
  email: string;
  type: string;
  capaciteLits: number;
}
