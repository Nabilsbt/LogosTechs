import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { EventEntity } from '../../models/event.model';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss']
})
export class EventListComponent implements OnInit {
  events: EventEntity[] = [];
  loading = false;
  error?: string;

  constructor(private eventService: EventService, private router: Router) {}

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    this.loading = true;
    this.error = undefined;
    this.eventService.getAll().subscribe({
      next: (data) => {
        this.events = data || [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement des événements.';
        this.loading = false;
      }
    });
  }

  create(): void {
    this.router.navigate(['/events/new']);
  }

  edit(eventItem: EventEntity): void {
    if (eventItem.id == null) return;
    this.router.navigate(['/events', eventItem.id, 'edit']);
  }

  view(eventItem: EventEntity): void {
    if (eventItem.id == null) return;
    this.router.navigate(['/events', eventItem.id]);
  }

  remove(eventItem: EventEntity): void {
    if (eventItem.id == null) return;
    if (!confirm('Supprimer cet événement ?')) return;
    this.eventService.delete(eventItem.id).subscribe({
      next: () => this.fetch(),
      error: () => (this.error = 'Suppression échouée.')
    });
  }
}


