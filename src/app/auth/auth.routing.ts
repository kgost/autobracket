import { Routes, RouterModule } from '@angular/router';

import { SignupComponent } from './signup/signup.component';
import { SettingsComponent } from './settings/settings.component';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { AdminTournamentListComponent } from './admin-tournament/admin-tournament-list/admin-tournament-list.component';

export const AUTH_ROUTES: Routes = [
	{ path: '', redirectTo: 'signup', pathMatch: 'full' },
	{ path: 'signup', component: SignupComponent },
	{ path: 'settings', component: SettingsComponent },
	{ path: 'login', component: LoginComponent },
	{ path: 'logout', component: LogoutComponent },
	{ path: 'tournaments', component: AdminTournamentListComponent }
];

export const authRouting = RouterModule.forChild(AUTH_ROUTES);