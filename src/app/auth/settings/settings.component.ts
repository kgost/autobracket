import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Response } from '@angular/http';
import { AuthService } from '../auth.service';
import { User } from '../user';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  providers: [AuthService]
})
export class SettingsComponent implements OnInit {
	myForm: FormGroup;
	user: User;

  constructor( private authService: AuthService, private router: Router ) { }

	ngOnInit() {
		this.myForm = new FormGroup({
			apiUser: new FormControl( null, Validators.required ),
			apiKey: new FormControl( null, Validators.required ),
			subDomain: new FormControl(),
		});

		this.authService.getLoggedUser()
										.then( response => {
											response = response.json();
											this.user = new User(
												null,
												null,
												response.chlngUname,
												response.chlngKey,
												response.subDomain
											);
											this.myForm.controls.apiUser.setValue( this.user.chlngUname );
											this.myForm.controls.apiKey.setValue( this.user.chlngKey );
											this.myForm.controls.subDomain.setValue( this.user.subDomain );
										} );
	}

  onSubmit() {
		const user = new User(
			null,
			null,
			this.myForm.value.apiUser,
			this.myForm.value.apiKey,
			this.myForm.value.subDomain
		);

		this.authService.update( user );
  }
}
