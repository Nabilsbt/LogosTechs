import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserListComponent } from './components/users/user-list.component';
import { UrgenceListComponent } from './components/urgences/urgence-list.component';
import { HopitalListComponent } from './components/hopitaux/hopital-list.component';
import { HopitalFormComponent } from './components/hopitaux/hopital-form.component';

const routes: Routes = [
  { path: '', redirectTo: '/hopitaux', pathMatch: 'full' },
  { path: 'users', component: UserListComponent },
  { path: 'urgences', component: UrgenceListComponent },
  { path: 'hopitaux', component: HopitalListComponent },
  { path: 'hopitaux/create', component: HopitalFormComponent },
  { path: 'hopitaux/edit/:id', component: HopitalFormComponent },
  { path: '**', redirectTo: '/hopitaux' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
