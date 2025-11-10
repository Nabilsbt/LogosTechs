import { Component, OnInit } from '@angular/core';
import { Hopital } from '../../models/hopital.model';
import { HopitalService } from '../../services/hopital.service';

@Component({
  selector: 'app-hopital-list',
  templateUrl: './hopital-list.component.html',
  styleUrls: ['./hopital-list.component.scss']
})
export class HopitalListComponent implements OnInit {
  hopitaux: Hopital[] = [];
  searchKeyword: string = '';

  constructor(private hopitalService: HopitalService) { }

  ngOnInit(): void {
    this.loadHopitaux();
  }

  loadHopitaux(): void {
    this.hopitalService.getAllHopitaux().subscribe({
      next: (data) => this.hopitaux = data,
      error: (error) => console.error('Erreur lors du chargement:', error)
    });
  }

  search(): void {
    if (this.searchKeyword.trim()) {
      this.hopitalService.searchHopitaux(this.searchKeyword).subscribe({
        next: (data) => this.hopitaux = data,
        error: (error) => console.error('Erreur lors de la recherche:', error)
      });
    } else {
      this.loadHopitaux();
    }
  }

  deleteHopital(id: number): void {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet hôpital ?')) return;

  this.hopitalService.deleteHopital(id).subscribe({
    next: () => {
      // update local list using unified `id` field
      this.hopitaux = this.hopitaux.filter(h => (h.id ?? h.idHopital) !== id);
      alert('Hôpital supprimé avec succès !');
    },
    error: (err) => {
      alert('Erreur : ' + (err.error || 'Suppression impossible'));
    }
  });
}
}
