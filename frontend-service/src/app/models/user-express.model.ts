// Nouveaux modèles pour le service user-express (Node.js + Keycloak)

export interface KeycloakUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  emailVerified: boolean;
  createdTimestamp: number;
  attributes?: {
    [key: string]: string[];
  };
  realmRoles?: string[];
  // Propriétés dérivées des attributes
  speciality?: string;
  department?: string;
  phone?: string;
  licenseNumber?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  roles: string[];
  attributes?: {
    [key: string]: any;
  };
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  enabled?: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Modèles pour les nouvelles fonctionnalités
export interface Review {
  _id?: string;
  doctorId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt?: Date;
  updatedAt?: Date;
  replies?: Reply[];
  likes?: string[];
}

export interface Reply {
  _id?: string;
  userId: string;
  comment: string;
  createdAt?: Date;
  likes?: string[];
}

export interface Appointment {
  _id?: string;
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
