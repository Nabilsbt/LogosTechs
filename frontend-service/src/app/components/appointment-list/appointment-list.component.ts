import { Component, OnInit } from '@angular/core';
import { AppointmentsService } from '../../services/appointments.service';

type Status = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  startTime: string; // ISO Z
  endTime: string;   // ISO Z
  status: Status;
  reason?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-appointment-list',
  templateUrl: './appointment-list.component.html',
  styleUrls: ['./appointment-list.component.scss']
})
export class AppointmentListComponent implements OnInit {

  // UI state
  loading = false;
  error = '';

  // Filtres
  q = '';
  doctorId?: number;
  patientId?: number;
  status?: Status;
  from?: string; // yyyy-MM-dd
  to?: string;   // yyyy-MM-dd

  // Données
  rows: Appointment[] = [];
  filtered: Appointment[] = []; // filtrage côté front (rapide)
  total = 0;

  // Stats (exemple simple, computed côté front)
  stats = [
    { label: 'Total', value: 0 },
    { label: 'Confirmés', value: 0 },
    { label: 'En attente', value: 0 },
    { label: 'Annulés', value: 0 }
  ];

  // pagination simple côté front (si besoin)
  pageIndex = 0;
  pageSize = 50;

  constructor(private api: AppointmentsService) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.error = '';
    this.loading = true;
    this.api.list(this.pageIndex, this.pageSize).subscribe({
      next: (page: any) => {
        // Spring Page => { content, totalElements, ... }
        this.rows = page?.content ?? [];
        this.total = page?.totalElements ?? this.rows.length;
        this.computeStats();
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Erreur de chargement des rendez-vous';
        this.loading = false;
      }
    });
  }

  computeStats() {
    const all = this.rows;
    const count = (s: Status) => all.filter(a => a.status === s).length;
    this.stats = [
      { label: 'Total', value: all.length },
      { label: 'Confirmés', value: count('CONFIRMED') },
      { label: 'En attente', value: count('PENDING') },
      { label: 'Annulés', value: count('CANCELLED') },
    ];
  }

  applyFilters() {
    const q = (this.q || '').toLowerCase().trim();
    const fromTs = this.from ? new Date(this.from + 'T00:00:00Z').getTime() : undefined;
    const toTs   = this.to   ? new Date(this.to   + 'T23:59:59Z').getTime() : undefined;

    this.filtered = this.rows.filter(a => {
      if (this.doctorId && a.doctorId !== +this.doctorId) return false;
      if (this.patientId && a.patientId !== +this.patientId) return false;
      if (this.status && a.status !== this.status) return false;

      const st = new Date(a.startTime).getTime();
      if (fromTs && st < fromTs) return false;
      if (toTs && st > toTs) return false;

      if (q) {
        const hay = `${a.reason ?? ''} ${a.id} ${a.patientId} ${a.doctorId}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  resetFilters() {
    this.q = '';
    this.doctorId = undefined;
    this.patientId = undefined;
    this.status = undefined;
    this.from = undefined;
    this.to = undefined;
    this.applyFilters();
  }

  toLocal(iso: string) {
    const d = new Date(iso);
    // Affichage compact FR
    return d.toLocaleString(undefined, {
      year: '2-digit', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  }

  statusBadgeClass(s: Status) {
    switch (s) {
      case 'CONFIRMED': return 'bg-success';
      case 'PENDING':   return 'bg-secondary';
      case 'CANCELLED': return 'bg-danger';
      case 'COMPLETED': return 'bg-primary';
      default:          return 'bg-light text-dark';
    }
  }

  quickAction(a: Appointment, action: Status | 'DELETE') {
    if (action === 'DELETE') {
      if (!confirm(`Supprimer le rendez-vous #${a.id} ?`)) return;
      this.api.remove(a.id).subscribe({
        next: () => this.load(),
        error: (e) => { console.error(e); alert('Suppression échouée'); }
      });
      return;
    }
    this.api.changeStatus(a.id, action).subscribe({
      next: () => this.load(),
      error: (e) => { console.error(e); alert('Action échouée'); }
    });
  }
}
