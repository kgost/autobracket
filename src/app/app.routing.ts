import { Routes, RouterModule } from '@angular/router';

import { AuthComponent } from './auth/auth.component';
import { LandingComponent } from './general/landing/landing.component';

const APP_ROUTES: Routes = [
	{ path: '', component: LandingComponent },
	{ path: 'admin', component: AuthComponent, loadChildren: './auth/auth.module#AuthModule' }
];

export const routing = RouterModule.forRoot( APP_ROUTES );