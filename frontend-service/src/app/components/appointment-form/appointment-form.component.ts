import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppointmentsService } from '../../services/appointments.service';
import { Appointment } from '../../models/appointment.model';

@Component({
  selector: 'app-appointment-form',
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.scss']
})
export class AppointmentFormComponent {
  submitting = false;
  error?: string;

  form = this.fb.group({
    patientId: [1, [Validators.required, Validators.min(1)]],
    doctorId: [101, [Validators.required, Validators.min(1)]],
    startLocal: ['', Validators.required], // datetime-local
    endLocal:   ['', Validators.required],
    reason:     ['Consultation']
  });

  constructor(
    private fb: FormBuilder,
    private api: AppointmentsService,
    private router: Router
  ) {}

  private toIsoZ(localValue: string): string {
    const d = new Date(localValue);
    return new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString();
  }

  get f() { return this.form.controls; }

  preview() {
    const v = this.form.value;
    if (!v.startLocal || !v.endLocal) return '';
    const start = new Date(v.startLocal);
    const end   = new Date(v.endLocal);
    return `${start.toLocaleString()} → ${end.toLocaleString()}`;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    const payload: Appointment = {
      patientId: Number(v.patientId),
      doctorId: Number(v.doctorId),
      startTime: this.toIsoZ(v.startLocal!),
      endTime: this.toIsoZ(v.endLocal!),
      reason: v.reason || ''
    };

    this.submitting = true;
    this.api.create(payload).subscribe({
      next: () => this.router.navigateByUrl('/appointments'),
      error: (err: any) => {
        console.error(err);
        this.error = err?.error?.message || 'Création échouée';
        this.submitting = false;
      }
    });
  }
}
