import { Routes, RouterModule } from '@angular/router';

import { AuthComponent } from './auth/auth.component';
import { LandingComponent } from './general/landing/landing.component';
import { TournamentListComponent } from './tournaments/tournament-list/tournament-list.component';

const APP_ROUTES: Routes = [
	{ path: '', component: LandingComponent },
	{ path: 'admin', component: AuthComponent, loadChildren: './auth/auth.module#AuthModule' },
	{ path: 'tournaments', component: TournamentListComponent }
];

export const routing = RouterModule.forRoot( APP_ROUTES );