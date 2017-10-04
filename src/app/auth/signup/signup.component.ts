import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Response } from '@angular/http';
import { AuthService } from '../auth.service';
import { User } from '../user';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  providers: [AuthService]
})
export class SignupComponent implements OnInit {
	myForm: FormGroup;

  constructor( private authService: AuthService, private router: Router ) { }

	ngOnInit() {
		this.myForm = new FormGroup({
			username: new FormControl( null, Validators.required ),
			password: new FormControl( null, Validators.required ),
			apiUser: new FormControl( null, Validators.required ),
			apiKey: new FormControl( null, Validators.required ),
			subDomain: new FormControl(),
		});
	}

  onSubmit() {
		const user = new User(
			this.myForm.value.username,
			this.myForm.value.password,
			this.myForm.value.apiUser,
			this.myForm.value.apiKey,
			this.myForm.value.subDomain
		);

		this.authService.signup( user );
  }
}
