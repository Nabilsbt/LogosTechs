import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Composants Users & Urgences (Nabil)
import { UserExpressListComponent } from './components/users/user-express-list.component';
import { UrgenceListComponent } from './components/urgences/urgence-list.component';

// Composants Events (Aziz)
import { EventListComponent } from './components/events/event-list.component';
import { EventFormComponent } from './components/events/event-form.component';
import { EventDetailComponent } from './components/events/event-detail.component';

// Composants Hopitaux (Eya)
import { HopitalListComponent } from './components/hopitaux/hopital-list.component';
import { HopitalFormComponent } from './components/hopitaux/hopital-form.component';

// Composants Assurances (Mahdi)
import { AssuranceListComponent } from './components/assurances/assurance-list.component';
import { AssuranceFormComponent } from './components/assurances/assurance-form.component';

// Composants Pharmacies (Yahya)
import { PharmaciesComponent } from './components/pharmacies/pharmacies.component';

const routes: Routes = [
  { path: '', redirectTo: '/urgences', pathMatch: 'full' },
  
  // Routes Users & Urgences (Nabil)
  { path: 'users', component: UserExpressListComponent },
  { path: 'urgences', component: UrgenceListComponent },
  
  // Routes Events (Aziz)
  { path: 'events', component: EventListComponent },
  { path: 'events/new', component: EventFormComponent },
  { path: 'events/:id', component: EventDetailComponent },
  { path: 'events/:id/edit', component: EventFormComponent },
  
  // Routes Hopitaux (Eya)
  { path: 'hopitaux', component: HopitalListComponent },
  { path: 'hopitaux/create', component: HopitalFormComponent },
  { path: 'hopitaux/edit/:id', component: HopitalFormComponent },
  
  // Routes Assurances (Mahdi)
  { path: 'assurances', component: AssuranceListComponent },
  { path: 'assurances/new', component: AssuranceFormComponent },
  { path: 'assurances/edit/:id', component: AssuranceFormComponent },
  
  // Routes Pharmacies (Yahya)
  { path: 'pharmacies', component: PharmaciesComponent },
  
  { path: '**', redirectTo: '/urgences' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
