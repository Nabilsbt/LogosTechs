export interface Urgence {
  id?: number;
  patientName: string;
  patientAge: string;
  symptoms: string;
  description: string;
  priority: Priority;
  status: UrgenceStatus;
  assignedDoctorId?: number;
  roomNumber?: string;
  arrivalTime?: string;
  triageTime?: string;
  treatmentStartTime?: string;
  dischargeTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum UrgenceStatus {
  WAITING = 'WAITING',
  TRIAGED = 'TRIAGED',
  IN_TREATMENT = 'IN_TREATMENT',
  DISCHARGED = 'DISCHARGED',
  TRANSFERRED = 'TRANSFERRED'
}

export interface CreateUrgenceRequest {
  patientName: string;
  patientAge: string;
  symptoms: string;
  description: string;
  priority: Priority;
}

export interface UpdateUrgenceRequest {
  patientName?: string;
  patientAge?: string;
  symptoms?: string;
  description?: string;
  priority?: Priority;
  status?: UrgenceStatus;
  assignedDoctorId?: number;
  roomNumber?: string;
}

export interface TriageRequest {
  priority: Priority;
  doctorId: number;
}

export interface TreatmentRequest {
  roomNumber: string;
}
