import { Component, OnInit } from '@angular/core';
import { AppointmentsService } from '../../services/appointments.service';
import { Appointment, AppointmentStatus } from '../../models/appointment.model';

type Stat = { label: string; value: number; };

@Component({
  selector: 'app-appointment-list',
  templateUrl: './appointment-list.component.html',
  styleUrls: ['./appointment-list.component.scss']
})
export class AppointmentListComponent implements OnInit {
  appointments: Appointment[] = [];
  filtered: Appointment[] = [];
  loading = false;
  error?: string;

  // Filtres UI
  q = '';
  doctorId?: number;
  patientId?: number;
  status?: AppointmentStatus;
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD

  // Stats headline
  stats: Stat[] = [
    { label: 'Total', value: 0 },
    { label: 'Confirmés', value: 0 },
    { label: 'En attente', value: 0 },
    { label: 'Annulés', value: 0 },
  ];

  constructor(private api: AppointmentsService) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.api.findAll().subscribe({
      next: (data) => {
        // tri par date décroissante
        this.appointments = [...data].sort((a,b) => (b.startTime?.localeCompare(a.startTime||'')||0));
        this.applyFilters();
        this.computeStats();
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
    const t = this.appointments;
    const count = (s?: AppointmentStatus) => t.filter(x => x.status === s).length;
    this.stats = [
      { label: 'Total', value: t.length },
      { label: 'Confirmés', value: count('CONFIRMED') },
      { label: 'En attente', value: count('PENDING') },
      { label: 'Annulés', value: count('CANCELLED') },
    ];
  }

  applyFilters() {
    const q = this.q.trim().toLowerCase();
    const fromTs = this.from ? new Date(this.from).getTime() : undefined;
    const toTs = this.to ? new Date(this.to + 'T23:59:59').getTime() : undefined;

    this.filtered = this.appointments.filter(a => {
      // recherche texte (reason)
      const matchesQ = !q || (a.reason || '').toLowerCase().includes(q);

      // doctor/patient
      const matchesDoctor = !this.doctorId || a.doctorId === Number(this.doctorId);
      const matchesPatient = !this.patientId || a.patientId === Number(this.patientId);

      // statut
      const matchesStatus = !this.status || a.status === this.status;

      // période
      const startMs = a.startTime ? new Date(a.startTime).getTime() : 0;
      const matchesFrom = fromTs ? (startMs >= fromTs) : true;
      const matchesTo = toTs ? (startMs <= toTs) : true;

      return matchesQ && matchesDoctor && matchesPatient && matchesStatus && matchesFrom && matchesTo;
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

  toLocal(iso?: string) {
    if (!iso) return '';
    return new Date(iso).toLocaleString();
  }

  statusBadgeClass(s?: AppointmentStatus) {
    switch (s) {
      case 'CONFIRMED': return 'bg-success';
      case 'PENDING': return 'bg-warning text-dark';
      case 'CANCELLED': return 'bg-danger';
      case 'COMPLETED': return 'bg-secondary';
      default: return 'bg-light text-dark';
    }
  }

  quickAction(a: Appointment, action: 'CONFIRMED'|'CANCELLED'|'COMPLETED'|'DELETE') {
    if (!a.id) return;
    if (action === 'DELETE') {
      if (!confirm(`Supprimer rendez-vous #${a.id} ?`)) return;
      this.api.delete(a.id).subscribe({ next: () => this.load() });
      return;
    }
    this.api.changeStatus(a.id, action).subscribe({ next: () => this.load() });
  }
}
