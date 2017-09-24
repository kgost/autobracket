import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Router } from '@angular/router';
import 'rxjs/add/operator/toPromise';

import { User } from './user';
import { ErrorService } from '../error/error.service';

@Injectable()
export class AuthService {
	private authUrl = '/api/auth';

  constructor( private http: Http, private errorService: ErrorService, private router: Router ) { }

	signup( user: User ): Promise<void | any> {
		return this.http.post( this.authUrl + '/signup', user )
										.toPromise()
										.then( response => {
											this.onSuccess( response );
										} )
										.catch( this.handleError );
	}

	login( user: User ): Promise<void | any> {
		return this.http.post( this.authUrl + '/login', user )
										.toPromise()
										.then( response => {
											this.onSuccess( response );
										} )
										.catch( error => {
											this.handleError( error );
										} );
	}

	logout() {
		localStorage.clear();
	}

	isLoggedIn() {
		return !!( localStorage.token );
	}

	private onSuccess( response: Response ) {
		var data = response.json();
		localStorage.setItem( 'token', data.token );
		localStorage.setItem( 'userId', data.userId );
	}

	private handleError( error: any ) {
		this.errorService.handleError( JSON.parse( error._body ).error.message );
	}
}
