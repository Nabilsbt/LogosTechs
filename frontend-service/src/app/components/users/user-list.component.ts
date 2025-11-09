import { Component, OnInit } from '@angular/core';
import { User, UserRole, CreateUserRequest } from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  loading = false;
  error: string | null = null;
  
  // Filters
  selectedRole: UserRole | 'ALL' = 'ALL';
  searchTerm = '';
  showActiveOnly = false;
  
  // Modal states
  showCreateModal = false;
  showEditModal = false;
  selectedUser: User | null = null;
  
  // Form data
  newUser: CreateUserRequest = {
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: UserRole.RECEPTIONIST,
    speciality: ''
  };
  
  // Enums for template
  UserRole = UserRole;
  userRoles = Object.values(UserRole);

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;
    
    this.userService.getAllUsers().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.users = response.data;
          this.applyFilters();
        } else {
          this.error = response.error || 'Erreur lors du chargement des utilisateurs';
        }
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
      const roleMatch = this.selectedRole === 'ALL' || user.role === this.selectedRole;
      
      // Search filter
      const searchMatch = !this.searchTerm || 
        user.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      // Active filter
      const activeMatch = !this.showActiveOnly || user.active;
      
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
      role: UserRole.RECEPTIONIST,
      speciality: ''
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
    this.userService.createUser(this.newUser).subscribe({
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

  editUser(user: User): void {
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
      firstName: this.selectedUser.firstName,
      lastName: this.selectedUser.lastName,
      email: this.selectedUser.email,
      role: this.selectedUser.role,
      speciality: this.selectedUser.speciality,
      active: this.selectedUser.active
    };

    this.loading = true;
    this.userService.updateUser(this.selectedUser.id!, updateData).subscribe({
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

  toggleUserStatus(user: User): void {
    const action = user.active ? 'deactivateUser' : 'activateUser';
    
    this.userService[action](user.id!).subscribe({
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

  deleteUser(user: User): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.fullName || user.username} ?`)) {
      return;
    }

    this.userService.deleteUser(user.id!).subscribe({
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

  getRoleLabel(role: UserRole): string {
    return this.userService.getRoleLabel(role);
  }

  getRoleColor(role: UserRole): string {
    return this.userService.getRoleColor(role);
  }

  private isValidUser(user: CreateUserRequest): boolean {
    return !!(user.username && user.email && user.password && 
             user.firstName && user.lastName && user.role);
  }

  clearError(): void {
    this.error = null;
  }
}
