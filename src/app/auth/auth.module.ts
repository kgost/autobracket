import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { LogoutComponent } from './logout/logout.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { authRouting } from './auth.routing';
import { AdminTournamentInputComponent } from './admin-tournament/admin-tournament-input/admin-tournament-input.component';
import { AdminTournamentListComponent } from './admin-tournament/admin-tournament-list/admin-tournament-list.component';
import { AdminTournamentComponent } from './admin-tournament/admin-tournament.component';
import { SettingsComponent } from './settings/settings.component';

@NgModule({
	declarations: [
    LogoutComponent,
    SignupComponent,
    LoginComponent,
    AdminTournamentInputComponent,
    AdminTournamentListComponent,
    AdminTournamentComponent,
    SettingsComponent
	],
	imports: [
		CommonModule,
  	ReactiveFormsModule,
  	authRouting
	]
})
export class AuthModule {
	
}