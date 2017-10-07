import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { routing } from './app.routing';
import { ContactDetailsComponent } from './contacts/contact-details/contact-details.component';
import { ContactListComponent } from './contacts/contact-list/contact-list.component';
import { AuthComponent } from './auth/auth.component';
import { HeaderComponent } from './general/header/header.component';
import { LandingComponent } from './general/landing/landing.component';
import { AuthService } from './auth/auth.service';
import { ErrorComponent } from './error/error.component';
import { ErrorService } from './error/error.service';
import { TournamentListComponent } from './tournaments/tournament-list/tournament-list.component';
import { TournamentDetailsComponent } from './tournaments/tournament-details/tournament-details.component';
import { BracketComponent } from './tournaments/bracket/bracket.component';
import { AboutComponent } from './general/about/about.component';
import { ResponseComponent } from './response/response.component';
import { ResponseService } from './response/response.service';
import { MainService } from './general/main.service';

@NgModule({
  declarations: [
    AppComponent,
    ContactDetailsComponent,
    ContactListComponent,
    AuthComponent,
    HeaderComponent,
    LandingComponent,
    ErrorComponent,
    TournamentListComponent,
    TournamentDetailsComponent,
    BracketComponent,
    AboutComponent,
    ResponseComponent
  ],
  imports: [
    BrowserModule,
    routing,
    FormsModule,
    ReactiveFormsModule,
    HttpModule
  ],
  providers: [MainService, AuthService, ErrorService, ResponseService],
  bootstrap: [AppComponent]
})
export class AppModule { }
