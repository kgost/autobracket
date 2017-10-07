import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Response } from '@angular/http';
import { AuthService } from '../auth.service';
import { User } from '../user';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
	myForm: FormGroup;

  constructor( private authService: AuthService, private router: Router ) { }

  ngOnInit() {
  	this.myForm = new FormGroup({
  		username: new FormControl( null, Validators.required ),
  		password: new FormControl( null, Validators.required )
  	});
  }
  
  onSubmit() {
  	const user = new User(
  		this.myForm.value.username,
  		this.myForm.value.password );

  	this.authService.login( user );
  }
}
