import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { LogoutComponent } from './logout/logout.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { authRouting } from './auth.routing';

@NgModule({
	declarations: [
    LogoutComponent,
    SignupComponent,
    LoginComponent
	],
	imports: [
		CommonModule,
  	ReactiveFormsModule,
  	authRouting
	]
})
export class AuthModule {
	
}