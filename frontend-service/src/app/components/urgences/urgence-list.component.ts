import { Component, OnInit } from '@angular/core';
import { Urgence, Priority, UrgenceStatus, CreateUrgenceRequest } from '../../models/urgence.model';
import { UrgenceService } from '../../services/urgence.service';
import { UserExpressService } from '../../services/user-express.service';
import { KeycloakUser } from '../../models/user-express.model';

// Interface locale pour les réponses API
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

@Component({
  selector: 'app-urgence-list',
  templateUrl: './urgence-list.component.html',
  styleUrls: ['./urgence-list.component.scss']
})
export class UrgenceListComponent implements OnInit {
  urgences: Urgence[] = [];
  filteredUrgences: Urgence[] = [];
  doctors: KeycloakUser[] = [];
  loading = false;
  error: string | null = null;
  
  // Filters
  selectedStatus: UrgenceStatus | 'ALL' = 'ALL';
  selectedPriority: Priority | 'ALL' = 'ALL';
  searchTerm = '';
  
  // Modal states
  showCreateModal = false;
  showTriageModal = false;
  showTreatmentModal = false;
  selectedUrgence: Urgence | null = null;
  
  // Form data
  newUrgence: CreateUrgenceRequest = {
    patientName: '',
    patientAge: '',
    symptoms: '',
    description: '',
    priority: Priority.MEDIUM
  };
  
  triageData = {
    priority: Priority.MEDIUM,
    doctorId: 0
  };
  
  treatmentData = {
    roomNumber: ''
  };
  
  // Enums for template
  Priority = Priority;
  UrgenceStatus = UrgenceStatus;
  priorities = Object.values(Priority);
  statuses = Object.values(UrgenceStatus);

  constructor(
    private urgenceService: UrgenceService,
    private userExpressService: UserExpressService
  ) {}

  ngOnInit(): void {
    this.loadUrgences();
    this.loadDoctors();
  }

  loadUrgences(): void {
    this.loading = true;
    this.error = null;
    
    this.urgenceService.getAllUrgences().subscribe({
      next: (response: ApiResponse<Urgence[]>) => {
        if (response.success && response.data) {
          this.urgences = response.data;
          this.applyFilters();
        } else {
          this.error = response.error || 'Erreur lors du chargement des urgences';
        }
        this.loading = false;
      },
      error: (error: any) => {
        this.error = 'Erreur de connexion au service urgences';
        this.loading = false;
        console.error('Error loading urgences:', error);
      }
    });
  }

  loadDoctors(): void {
    // Charger tous les utilisateurs et filtrer ceux qui ont le rôle "doctor"
    this.userExpressService.getAllUsers().subscribe({
      next: (users: KeycloakUser[]) => {
        this.doctors = users.filter(user => 
          user.enabled && 
          user.realmRoles && 
          user.realmRoles.includes('doctor')
        );
      },
      error: (error: any) => {
        console.error('Error loading doctors:', error);
      }
    });
  }

  applyFilters(): void {
    this.filteredUrgences = this.urgences.filter(urgence => {
      // Status filter
      const statusMatch = this.selectedStatus === 'ALL' || urgence.status === this.selectedStatus;
      
      // Priority filter
      const priorityMatch = this.selectedPriority === 'ALL' || urgence.priority === this.selectedPriority;
      
      // Search filter
      const searchMatch = !this.searchTerm || 
        urgence.patientName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        urgence.symptoms.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        urgence.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return statusMatch && priorityMatch && searchMatch;
    });

    // Sort by priority and arrival time
    this.filteredUrgences.sort((a, b) => {
      const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      return new Date(a.arrivalTime || '').getTime() - new Date(b.arrivalTime || '').getTime();
    });
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  onPriorityFilterChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  openCreateModal(): void {
    this.newUrgence = {
      patientName: '',
      patientAge: '',
      symptoms: '',
      description: '',
      priority: Priority.MEDIUM
    };
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  createUrgence(): void {
    if (!this.isValidUrgence(this.newUrgence)) {
      return;
    }

    this.loading = true;
    this.urgenceService.createUrgence(this.newUrgence).subscribe({
      next: (response: ApiResponse<Urgence>) => {
        if (response.success) {
          this.loadUrgences();
          this.closeCreateModal();
        } else {
          this.error = response.error || 'Erreur lors de la création de l\'urgence';
        }
        this.loading = false;
      },
      error: (error: any) => {
        this.error = 'Erreur lors de la création de l\'urgence';
        this.loading = false;
        console.error('Error creating urgence:', error);
      }
    });
  }

  openTriageModal(urgence: Urgence): void {
    this.selectedUrgence = urgence;
    this.triageData = {
      priority: urgence.priority,
      doctorId: urgence.assignedDoctorId || 0
    };
    this.showTriageModal = true;
  }

  closeTriageModal(): void {
    this.showTriageModal = false;
    this.selectedUrgence = null;
  }

  performTriage(): void {
    if (!this.selectedUrgence || !this.triageData.doctorId) return;

    this.loading = true;
    this.urgenceService.triageUrgence(this.selectedUrgence.id!, this.triageData).subscribe({
      next: (response: ApiResponse<Urgence>) => {
        if (response.success) {
          this.loadUrgences();
          this.closeTriageModal();
        } else {
          this.error = response.error || 'Erreur lors du triage';
        }
        this.loading = false;
      },
      error: (error: any) => {
        this.error = 'Erreur lors du triage';
        this.loading = false;
        console.error('Error performing triage:', error);
      }
    });
  }

  openTreatmentModal(urgence: Urgence): void {
    this.selectedUrgence = urgence;
    this.treatmentData = {
      roomNumber: urgence.roomNumber || ''
    };
    this.showTreatmentModal = true;
  }

  closeTreatmentModal(): void {
    this.showTreatmentModal = false;
    this.selectedUrgence = null;
  }

  startTreatment(): void {
    if (!this.selectedUrgence || !this.treatmentData.roomNumber) return;

    this.loading = true;
    this.urgenceService.startTreatment(this.selectedUrgence.id!, this.treatmentData).subscribe({
      next: (response: ApiResponse<Urgence>) => {
        if (response.success) {
          this.loadUrgences();
          this.closeTreatmentModal();
        } else {
          this.error = response.error || 'Erreur lors du démarrage du traitement';
        }
        this.loading = false;
      },
      error: (error: any) => {
        this.error = 'Erreur lors du démarrage du traitement';
        this.loading = false;
        console.error('Error starting treatment:', error);
      }
    });
  }

  dischargePatient(urgence: Urgence): void {
    if (!confirm(`Êtes-vous sûr de vouloir effectuer la sortie du patient ${urgence.patientName} ?`)) {
      return;
    }

    this.urgenceService.dischargePatient(urgence.id!).subscribe({
      next: (response: ApiResponse<Urgence>) => {
        if (response.success) {
          this.loadUrgences();
        } else {
          this.error = response.error || 'Erreur lors de la sortie du patient';
        }
      },
      error: (error: any) => {
        this.error = 'Erreur lors de la sortie du patient';
        console.error('Error discharging patient:', error);
      }
    });
  }

  deleteUrgence(urgence: Urgence): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'urgence de ${urgence.patientName} ?`)) {
      return;
    }

    this.urgenceService.deleteUrgence(urgence.id!).subscribe({
      next: (response: ApiResponse<void>) => {
        if (response.success) {
          this.loadUrgences();
        } else {
          this.error = response.error || 'Erreur lors de la suppression de l\'urgence';
        }
      },
      error: (error: any) => {
        this.error = 'Erreur lors de la suppression de l\'urgence';
        console.error('Error deleting urgence:', error);
      }
    });
  }

  getPriorityLabel(priority: Priority): string {
    return this.urgenceService.getPriorityLabel(priority);
  }

  getPriorityColor(priority: Priority): string {
    return this.urgenceService.getPriorityColor(priority);
  }

  getStatusLabel(status: UrgenceStatus): string {
    return this.urgenceService.getStatusLabel(status);
  }

  getStatusColor(status: UrgenceStatus): string {
    return this.urgenceService.getStatusColor(status);
  }

  getDoctorName(doctorId: number): string {
    const doctor = this.doctors.find(d => d.id === doctorId.toString());
    return doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Non assigné';
  }

  private isValidUrgence(urgence: CreateUrgenceRequest): boolean {
    return !!(urgence.patientName && urgence.patientAge && 
             urgence.symptoms && urgence.description && urgence.priority);
  }

  clearError(): void {
    this.error = null;
  }
}
