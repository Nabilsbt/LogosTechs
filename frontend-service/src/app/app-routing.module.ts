import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserListComponent } from './components/users/user-list.component';
import { UrgenceListComponent } from './components/urgences/urgence-list.component';
import {AppointmentFormComponent} from "./components/appointment-form/appointment-form.component";
import {AppointmentListComponent} from "./components/appointment-list/appointment-list.component";

const routes: Routes = [
  { path: '', redirectTo: '/urgences', pathMatch: 'full' },
  { path: 'users', component: UserListComponent },
  { path: 'urgences', component: UrgenceListComponent },
  { path: 'appointments', component: AppointmentListComponent },
  { path: 'appointments/new', component: AppointmentFormComponent },
  { path: '**', redirectTo: '/urgences' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
