import { Component, OnInit } from '@angular/core';
import { User, UserRole } from '../../models/user.model';
import { ApiResponse } from '../../models/common.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  loading = false;
  error: string | null = null;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;
    
    this.userService.getAllUsers().subscribe({
      next: (response) => {
        if (response.success) {
          this.users = response.data;
        } else {
          this.error = response.message || 'Erreur lors du chargement des utilisateurs';
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur de connexion au serveur';
        this.loading = false;
        console.error('Erreur:', error);
      }
    });
  }

  deleteUser(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.userService.deleteUser(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadUsers(); // Recharger la liste
          } else {
            this.error = response.message || 'Erreur lors de la suppression';
          }
        },
        error: (error) => {
          this.error = 'Erreur lors de la suppression';
          console.error('Erreur:', error);
        }
      });
    }
  }

  getRoleLabel(role: UserRole): string {
    switch (role) {
      case UserRole.ADMIN: return 'Administrateur';
      case UserRole.DOCTOR: return 'Médecin';
      case UserRole.NURSE: return 'Infirmier';
      case UserRole.PATIENT: return 'Patient';
      case UserRole.PHARMACIST: return 'Pharmacien';
      default: return role;
    }
  }
}
