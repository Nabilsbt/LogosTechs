import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Composants Users & Urgences (Nabil)
import { UserListComponent } from './components/users/user-list.component';
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

@NgModule({
  declarations: [
    AppComponent,
    // Composants Users & Urgences (Nabil)
    UserListComponent,
    UrgenceListComponent,
    // Composants Events (Aziz)
    EventListComponent,
    EventFormComponent,
    EventDetailComponent,
    // Composants Hopitaux (Eya)
    HopitalListComponent,
    HopitalFormComponent,
    // Composants Assurances (Mahdi)
    AssuranceListComponent,
    AssuranceFormComponent,
    // Composants Pharmacies (Yahya)
    PharmaciesComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    DatePipe,
    TitleCasePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
