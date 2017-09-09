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

  onSubmit() {
  	const user = new User(
  		this.myForm.value.email,
  		this.myForm.value.password,
  		this.myForm.value.firstName,
  		this.myForm.value.lastName );

  	this.authService.signup( user );

  	this.myForm.reset();
  }

  ngOnInit() {
  	this.myForm = new FormGroup({
  		firstName: new FormControl( null, Validators.required ),
  		lastName: new FormControl( null, Validators.required ),
  		email: new FormControl( null, [
				Validators.required,
				Validators.pattern( /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ )
  		] ),
  		password: new FormControl( null, Validators.required )
  	});
  }
}
