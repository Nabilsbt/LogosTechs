import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UserListComponent } from './components/users/user-list.component';
import { UrgenceListComponent } from './components/urgences/urgence-list.component';
import { AssuranceListComponent } from './components/assurances/assurance-list.component';
import { AssuranceFormComponent } from './components/assurances/assurance-form.component';

@NgModule({
  declarations: [
    AppComponent,
    UserListComponent,
    UrgenceListComponent,
    AssuranceListComponent,
    AssuranceFormComponent
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
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
