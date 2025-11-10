import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserListComponent } from './components/users/user-list.component';
import { UrgenceListComponent } from './components/urgences/urgence-list.component';
import { EventListComponent } from './components/events/event-list.component';
import { EventFormComponent } from './components/events/event-form.component';
import { EventDetailComponent } from './components/events/event-detail.component';

const routes: Routes = [
  { path: '', redirectTo: '/urgences', pathMatch: 'full' },
  { path: 'users', component: UserListComponent },
  { path: 'urgences', component: UrgenceListComponent },
  // Events
  { path: 'events', component: EventListComponent },
  { path: 'events/new', component: EventFormComponent },
  { path: 'events/:id', component: EventDetailComponent },
  { path: 'events/:id/edit', component: EventFormComponent },
  { path: '**', redirectTo: '/urgences' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
