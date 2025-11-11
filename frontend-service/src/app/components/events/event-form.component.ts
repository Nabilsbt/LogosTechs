import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { EventEntity } from '../../models/event.model';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss']
})
export class EventFormComponent implements OnInit {
  id?: number;
  model: EventEntity = {
    title: '',
    description: '',
    date: '',
    location: '',
    type: ''
  };
  loading = false;
  error?: string;
  isEdit = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.id = Number(idParam);
      this.fetch();
    }
  }

  fetch(): void {
    if (!this.id) return;
    this.loading = true;
    this.eventService.getById(this.id).subscribe({
      next: (data) => {
        // Convertir la date vers yyyy-MM-dd pour l'input type="date"
        const iso = data.date ? new Date(data.date).toISOString().substring(0, 10) : '';
        this.model = { ...data, date: iso };
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger cet événement.';
        this.loading = false;
      }
    });
  }

  submit(): void {
    this.error = undefined;
    if (this.isEdit && this.id) {
      this.eventService.update(this.id, this.model).subscribe({
        next: () => this.router.navigate(['/events']),
        error: () => (this.error = 'La mise à jour a échoué.')
      });
    } else {
      this.eventService.create(this.model).subscribe({
        next: () => this.router.navigate(['/events']),
        error: () => (this.error = 'La création a échoué.')
      });
    }
  }
}
