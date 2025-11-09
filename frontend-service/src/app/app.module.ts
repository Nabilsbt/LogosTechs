import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UserListComponent } from './components/users/user-list.component';
import { UrgenceListComponent } from './components/urgences/urgence-list.component';

@NgModule({
  declarations: [
    AppComponent,
    UserListComponent,
    UrgenceListComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
