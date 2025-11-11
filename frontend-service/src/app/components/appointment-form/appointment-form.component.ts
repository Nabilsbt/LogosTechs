import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AppointmentsService } from '../../services/appointments.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-appointment-form',
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.scss']
})
export class AppointmentFormComponent {
  loading = false;
  error = '';

  form = this.fb.group({
    patientId: [null, [Validators.required, Validators.min(1)]],
    doctorId:  [null, [Validators.required, Validators.min(1)]],
    start:     ['',  [Validators.required]], // datetime-local
    end:       ['',  [Validators.required]],
    reason:    ['Consultation', [Validators.maxLength(500)]]
  });

  constructor(
    private fb: FormBuilder,
    private api: AppointmentsService,
    private router: Router
  ) {}

  // helpers d’affichage
  toPreview(ctl: 'start' | 'end') {
    const v = this.form.value[ctl];
    if (!v) return '—';
    const d = new Date(v);
    return d.toLocaleString();
  }

  private buildPayload() {
    const v = this.form.value;
    const start = new Date(v.start!);
    const end   = new Date(v.end!);

    if (!(end > start)) {
      throw new Error('La fin doit être après le début.');
    }

    return {
      patientId: Number(v.patientId),
      doctorId: Number(v.doctorId),
      startTime: start.toISOString(), // ISO avec Z — requis par le backend
      endTime:   end.toISOString(),
      reason: (v.reason ?? '').trim()
    };
  }

  submit() {
    this.error = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    let payload: any;
    try {
      payload = this.buildPayload();
    } catch (e: any) {
      this.error = e?.message || 'Données invalides';
      return;
    }

    this.loading = true;
    this.api.create(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl('/appointments');
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.error = err?.error?.message || 'Création échouée';
      }
    });
  }
}
