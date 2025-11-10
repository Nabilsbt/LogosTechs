import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserListComponent } from './components/users/user-list.component';
import { UrgenceListComponent } from './components/urgences/urgence-list.component';
import { AssuranceListComponent } from './components/assurances/assurance-list.component';
import { AssuranceFormComponent } from './components/assurances/assurance-form.component';

const routes: Routes = [
  { path: '', redirectTo: '/urgences', pathMatch: 'full' },
  { path: 'users', component: UserListComponent },
  { path: 'urgences', component: UrgenceListComponent },
  { path: 'assurances', component: AssuranceListComponent },
  { path: 'assurances/form', component: AssuranceFormComponent },
  { path: 'assurances/form/:id', component: AssuranceFormComponent },
  { path: '**', redirectTo: '/urgences' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
