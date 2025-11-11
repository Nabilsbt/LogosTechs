import { Component, OnInit } from '@angular/core';
import { KeycloakUser, CreateUserRequest } from '../../models/user-express.model';
import { UserExpressService } from '../../services/user-express.service';

@Component({
  selector: 'app-user-express-list',
  templateUrl: './user-express-list.component.html',
  styleUrls: ['./user-express-list.component.scss']
})
export class UserExpressListComponent implements OnInit {
  users: KeycloakUser[] = [];
  filteredUsers: KeycloakUser[] = [];
  loading = false;
  error: string | null = null;
  
  // Filters
  selectedRole: string | 'ALL' = 'ALL';
  searchTerm = '';
  showActiveOnly = false;
  
  // Modal states
  showCreateModal = false;
  showEditModal = false;
  selectedUser: KeycloakUser | null = null;
  
  // Form data
  newUser: CreateUserRequest = {
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'patient'
  };
  
  // Available roles
  availableRoles = ['admin', 'doctor', 'nurse', 'patient', 'pharmacist', 'insurance_agent'];

  constructor(private userExpressService: UserExpressService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;
    
    this.userExpressService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur de connexion au service utilisateurs';
        this.loading = false;
        console.error('Error loading users:', error);
      }
    });
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      // Role filter
      const roleMatch = this.selectedRole === 'ALL' || 
        (user.realmRoles && user.realmRoles.includes(this.selectedRole));
      
      // Search filter
      const searchMatch = !this.searchTerm || 
        user.firstName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      // Active filter
      const activeMatch = !this.showActiveOnly || user.enabled;
      
      return roleMatch && searchMatch && activeMatch;
    });
  }

  onRoleFilterChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onActiveFilterChange(): void {
    this.applyFilters();
  }

  openCreateModal(): void {
    this.newUser = {
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'patient'
    };
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  createUser(): void {
    if (!this.isValidUser(this.newUser)) {
      return;
    }

    this.loading = true;
    this.userExpressService.createUser(this.newUser).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadUsers();
          this.closeCreateModal();
        } else {
          this.error = response.error || 'Erreur lors de la création de l\'utilisateur';
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors de la création de l\'utilisateur';
        this.loading = false;
        console.error('Error creating user:', error);
      }
    });
  }

  editUser(user: KeycloakUser): void {
    this.selectedUser = { ...user };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedUser = null;
  }

  updateUser(): void {
    if (!this.selectedUser) return;

    const updateData = {
      username: this.selectedUser.username,
      firstName: this.selectedUser.firstName,
      lastName: this.selectedUser.lastName,
      email: this.selectedUser.email,
      enabled: this.selectedUser.enabled
    };

    this.loading = true;
    this.userExpressService.updateUser(this.selectedUser.id, updateData).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadUsers();
          this.closeEditModal();
        } else {
          this.error = response.error || 'Erreur lors de la modification de l\'utilisateur';
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors de la modification de l\'utilisateur';
        this.loading = false;
        console.error('Error updating user:', error);
      }
    });
  }

  toggleUserStatus(user: KeycloakUser): void {
    const updateData = { enabled: !user.enabled };
    
    this.userExpressService.updateUser(user.id, updateData).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadUsers();
        } else {
          this.error = response.error || 'Erreur lors du changement de statut';
        }
      },
      error: (error) => {
        this.error = 'Erreur lors du changement de statut';
        console.error('Error toggling user status:', error);
      }
    });
  }

  deleteUser(user: KeycloakUser): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.firstName} ${user.lastName} ?`)) {
      return;
    }

    this.userExpressService.deleteUser(user.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadUsers();
        } else {
          this.error = response.error || 'Erreur lors de la suppression de l\'utilisateur';
        }
      },
      error: (error) => {
        this.error = 'Erreur lors de la suppression de l\'utilisateur';
        console.error('Error deleting user:', error);
      }
    });
  }

  assignRole(user: KeycloakUser, roleName: string): void {
    this.userExpressService.assignRole(user.id, roleName).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadUsers();
        } else {
          this.error = response.error || 'Erreur lors de l\'attribution du rôle';
        }
      },
      error: (error) => {
        this.error = 'Erreur lors de l\'attribution du rôle';
        console.error('Error assigning role:', error);
      }
    });
  }

  removeRole(user: KeycloakUser, roleName: string): void {
    this.userExpressService.removeRole(user.id, roleName).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadUsers();
        } else {
          this.error = response.error || 'Erreur lors de la suppression du rôle';
        }
      },
      error: (error) => {
        this.error = 'Erreur lors de la suppression du rôle';
        console.error('Error removing role:', error);
      }
    });
  }

  resetPassword(user: KeycloakUser): void {
    const newPassword = prompt('Nouveau mot de passe:');
    if (!newPassword) return;

    this.userExpressService.resetPassword(user.id, newPassword, true).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Mot de passe réinitialisé avec succès');
        } else {
          this.error = response.error || 'Erreur lors de la réinitialisation du mot de passe';
        }
      },
      error: (error) => {
        this.error = 'Erreur lors de la réinitialisation du mot de passe';
        console.error('Error resetting password:', error);
      }
    });
  }

  getUserRoles(user: KeycloakUser): string[] {
    return user.realmRoles || [];
  }

  hasRole(user: KeycloakUser, role: string): boolean {
    return this.getUserRoles(user).includes(role);
  }

  getPhotoUrl(user: KeycloakUser): string | null {
    return user.attributes?.['photoUrl']?.[0] || null;
  }

  private isValidUser(user: CreateUserRequest): boolean {
    return !!(user.username && user.email && user.password && 
             user.firstName && user.lastName);
  }

  clearError(): void {
    this.error = null;
  }
}
