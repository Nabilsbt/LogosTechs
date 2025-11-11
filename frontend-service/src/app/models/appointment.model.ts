export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Appointment {
  id?: number;
  patientId: number;
  doctorId: number;
  startTime: string;
  endTime: string;
  reason?: string;
  status?: AppointmentStatus;
  createdAt?: string;
  updatedAt?: string;
}
