import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HopitalService } from '../../services/hopital.service';
import { Hopital } from '../../models/hopital.model';

@Component({
  selector: 'app-hopital-form',
  templateUrl: './hopital-form.component.html',
  styleUrls: ['./hopital-form.component.scss']
})
export class HopitalFormComponent implements OnInit {
  hopitalForm: FormGroup;
  isEditMode = false;
  hopitalId?: number;

  constructor(
    private fb: FormBuilder,
    private hopitalService: HopitalService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.hopitalForm = this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.hopitalId = +params['id'];
        this.loadHopital(this.hopitalId);
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      adresse: ['', [Validators.required]],
      telephone: ['', [Validators.required, Validators.pattern('\\d{8,15}')]],
      email: ['', [Validators.email]],
      type: ['public', [Validators.required]],
      capaciteLits: [1, [Validators.required, Validators.min(1), Validators.max(10000)]]
    });
  }

  loadHopital(id: number): void {
    this.hopitalService.getHopitalById(id).subscribe({
      next: (hopital) => this.hopitalForm.patchValue(hopital),
      error: (error) => console.error('Erreur lors du chargement:', error)
    });
  }

  onSubmit(): void {
  if (this.hopitalForm.invalid) {
    alert('Veuillez corriger les erreurs dans le formulaire.');
    return;
  }

  const hopital: Hopital = this.hopitalForm.value;
  const action = this.isEditMode ? 'modifié' : 'créé';

  const request = this.isEditMode && this.hopitalId
    ? this.hopitalService.updateHopital(this.hopitalId, hopital)
    : this.hopitalService.createHopital(hopital);

  request.subscribe({
    next: () => {
      alert(`Hôpital ${action} avec succès !`);
      this.router.navigate(['/hopitaux']);
    },
    error: (err) => {
      const msg = err.error || `Échec de la ${this.isEditMode ? 'modification' : 'création'}`;
      alert('Erreur : ' + msg);
    }
  });
}
}
