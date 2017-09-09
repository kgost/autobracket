import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Response } from '@angular/http';
import { AuthService } from '../auth.service';
import { User } from '../user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [AuthService]
})
export class LoginComponent implements OnInit {
	myForm: FormGroup;

  constructor( private authService: AuthService, private router: Router ) { }

  onSubmit() {
  	const user = new User(
  		this.myForm.value.email,
  		this.myForm.value.password );

  	this.authService.login( user );

  	this.myForm.reset();
  }

  ngOnInit() {
  	this.myForm = new FormGroup({
  		email: new FormControl( null, [
				Validators.required,
				Validators.pattern( /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ )
  		] ),
  		password: new FormControl( null, Validators.required )
  	});
  }

}
