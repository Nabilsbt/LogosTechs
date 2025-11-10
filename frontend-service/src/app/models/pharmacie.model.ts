export interface Pharmacie {
  id?: number;
  nom: string;
  adresse: string;
  telephone: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePharmacieRequest {
  nom: string;
  adresse: string;
  telephone: string;
  email: string;
}

export interface UpdatePharmacieRequest {
  nom?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
}