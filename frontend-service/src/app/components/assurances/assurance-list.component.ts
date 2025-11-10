import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AssuranceService } from '../../services/assurance.service';
import { Assurance } from '../../models/assurance.model';

@Component({
  selector: 'app-assurance-list',
  templateUrl: './assurance-list.component.html',
  styleUrls: ['./assurance-list.component.scss']
})
export class AssuranceListComponent implements OnInit {
  assurances: Assurance[] = [];
  loading: boolean = false;
  errorMessage: string = '';

  constructor(
    private assuranceService: AssuranceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAssurances();
  }

  loadAssurances(): void {
    this.loading = true;
    this.errorMessage = '';
    this.assuranceService.getAllAssurances().subscribe(
      (data: Assurance[]) => {
        this.assurances = data;
        this.loading = false;
      },
      (error) => {
        console.error('Error loading assurances:', error);
        this.errorMessage = 'Failed to load assurances. Please try again.';
        this.loading = false;
      }
    );
  }

  editAssurance(id: number | undefined): void {
    if (id) {
      this.router.navigate(['/assurances/form', id]);
    }
  }

  deleteAssurance(id: number | undefined): void {
    if (id && confirm('Are you sure you want to delete this assurance?')) {
      this.assuranceService.deleteAssurance(id).subscribe(
        () => {
          this.loadAssurances();
        },
        (error) => {
          console.error('Error deleting assurance:', error);
          this.errorMessage = 'Failed to delete assurance. Please try again.';
        }
      );
    }
  }

  addNewAssurance(): void {
    this.router.navigate(['/assurances/form']);
  }
}
