import { Routes, RouterModule } from '@angular/router';

import { ContactListComponent } from './contacts/contact-list/contact-list.component';
import { AuthComponent } from './auth/auth.component';
import { LandingComponent } from './general/landing/landing.component';

const APP_ROUTES: Routes = [
	{ path: '', component: LandingComponent },
	{ path: 'contacts', component: ContactListComponent },
	{ path: 'auth', component: AuthComponent, loadChildren: './auth/auth.module#AuthModule' }
];

export const routing = RouterModule.forRoot( APP_ROUTES );