import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserListComponent } from './components/users/user-list.component';
import { UrgenceListComponent } from './components/urgences/urgence-list.component';
import { PharmaciesComponent } from './components/pharmacies/pharmacies.component';

const routes: Routes = [
  { path: '', redirectTo: '/pharmacies', pathMatch: 'full' },
  { path: 'users', component: UserListComponent },
  { path: 'urgences', component: UrgenceListComponent },
  { path: 'pharmacies', component: PharmaciesComponent },
  { path: '**', redirectTo: '/pharmacies' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
