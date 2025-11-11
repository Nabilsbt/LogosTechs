import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Pharmacie } from '../../models/pharmacie.model';
import { PharmacieService } from '../../services/pharmacie.service';

@Component({
  selector: 'app-pharmacies',
  templateUrl: './pharmacies.component.html',
  styleUrls: ['./pharmacies.component.scss']
})
export class PharmaciesComponent implements OnInit {
  pharmacies: Pharmacie[] = [];
  formData: Partial<Pharmacie> = {
    nom: '',
    adresse: '',
    telephone: '',
    email: ''
  };
  isEditing = false;
  error = '';
  success = '';
  loading = false;

  constructor(private pharmacieService: PharmacieService) {}

  ngOnInit() {
    this.loadPharmacies();
  }

  loadPharmacies() {
    this.loading = true;
    this.error = '';
    this.pharmacieService.getAllPharmacies().subscribe({
      next: (data) => {
        this.pharmacies = data;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des pharmacies';
        console.error('Error loading pharmacies:', err);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  onSubmit(form: NgForm) {
    if (form.invalid) return;
    this.loading = true;
    this.error = '';
    this.success = '';

    if (this.isEditing && this.formData.id) {
      // Update
      this.pharmacieService.updatePharmacie(this.formData.id, this.formData as Pharmacie).subscribe({
        next: (data) => {
          this.success = 'Pharmacie mise à jour avec succès';
          this.loadPharmacies();
          this.resetForm(form);
        },
        error: (err) => {
          this.error = 'Erreur lors de la mise à jour de la pharmacie';
          console.error('Error updating pharmacy:', err);
        },
        complete: () => {
          this.loading = false;
        }
      });
    } else {
      // Create
      this.pharmacieService.createPharmacie(this.formData as Pharmacie).subscribe({
        next: (data) => {
          this.success = 'Pharmacie créée avec succès';
          this.loadPharmacies();
          this.resetForm(form);
        },
        error: (err) => {
          this.error = 'Erreur lors de la création de la pharmacie';
          console.error('Error creating pharmacy:', err);
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }

  editPharmacie(pharmacie: Pharmacie) {
    this.formData = { ...pharmacie };
    this.isEditing = true;
  }

  deletePharmacie(id: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette pharmacie ?')) return;
    
    this.loading = true;
    this.pharmacieService.deletePharmacie(id).subscribe({
      next: () => {
        this.loadPharmacies();
        this.success = 'Pharmacie supprimée avec succès';
      },
      error: () => this.error = 'Erreur lors de la suppression',
      complete: () => this.loading = false
    });
  }
  resetForm(form: NgForm) {
    form.resetForm();
    this.isEditing = false;
    this.formData = {
      nom: '',
      adresse: '',
      telephone: '',
      email: ''
    };
    this.error = '';
    this.success = '';
  }
}
