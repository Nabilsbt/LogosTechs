import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AssuranceService } from '../../services/assurance.service';
import { Assurance } from '../../models/assurance.model';

@Component({
  selector: 'app-assurance-form',
  templateUrl: './assurance-form.component.html',
  styleUrls: ['./assurance-form.component.scss']
})
export class AssuranceFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode: boolean = false;
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  assuranceId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private assuranceService: AssuranceService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    // Check if we're in edit mode
    this.route.params.subscribe((params: any) => {
      if (params['id']) {
        this.isEditMode = true;
        this.assuranceId = params['id'];
        if (this.assuranceId) {
          this.loadAssurance(this.assuranceId);
        }
      }
    });
  }

  initializeForm(): void {
    this.form = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      adresse: ['', [Validators.maxLength(150)]],
      telephone: ['', [Validators.pattern(/^[0-9\s\-\+\(\)]*$/)]],
      email: ['', [Validators.email]],
      couverture: ['', [Validators.maxLength(255)]]
    });
  }

  loadAssurance(id: number): void {
    this.loading = true;
    this.assuranceService.getAssuranceById(id).subscribe(
      (data: Assurance) => {
        this.form.patchValue(data);
        this.loading = false;
      },
      (error: any) => {
        console.error('Error loading assurance:', error);
        this.errorMessage = 'Failed to load assurance details.';
        this.loading = false;
      }
    );
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const assuranceData: Assurance = new Assurance(this.form.value);

    if (this.isEditMode && this.assuranceId) {
      // Update existing assurance
      this.assuranceService.updateAssurance(this.assuranceId, assuranceData).subscribe(
        () => {
          this.successMessage = 'Assurance updated successfully!';
          this.loading = false;
          setTimeout(() => {
            this.router.navigate(['/assurances']);
          }, 1500);
        },
        (error: any) => {
          console.error('Error updating assurance:', error);
          this.errorMessage = 'Failed to update assurance. Please try again.';
          this.loading = false;
        }
      );
    } else {
      // Add new assurance
      this.assuranceService.addAssurance(assuranceData).subscribe(
        () => {
          this.successMessage = 'Assurance created successfully!';
          this.loading = false;
          setTimeout(() => {
            this.router.navigate(['/assurances']);
          }, 1500);
        },
        (error: any) => {
          console.error('Error creating assurance:', error);
          this.errorMessage = 'Failed to create assurance. Please try again.';
          this.loading = false;
        }
      );
    }
  }

  onCancel(): void {
    this.router.navigate(['/assurances']);
  }

  get nom() {
    return this.form.get('nom');
  }

  get telephone() {
    return this.form.get('telephone');
  }

  get email() {
    return this.form.get('email');
  }
}
