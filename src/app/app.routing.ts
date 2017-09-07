import { Routes, RouterModule } from '@angular/router';

import { ContactListComponent } from './contacts/contact-list/contact-list.component';

const APP_ROUTES: Routes = [
	{ path: '', redirectTo: '/contacts', pathMatch: 'full' },
	{ path: 'contacts', component: ContactListComponent }
];

export const routing = RouterModule.forRoot( APP_ROUTES );