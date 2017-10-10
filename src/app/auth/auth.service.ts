import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Router } from '@angular/router';
import 'rxjs/add/operator/toPromise';

import { User } from './user';
import { ErrorService } from '../error/error.service';
import { ResponseService } from '../response/response.service';

@Injectable()
export class AuthService {
	private authUrl = '/api/auth';

  constructor( private responseService: ResponseService, private http: Http, private errorService: ErrorService, private router: Router ) { }

	signup( user: User ): Promise<void | any> {
		return this.http.post( this.authUrl + '/signup', user )
										.toPromise()
										.then( response => {
											this.onSuccess( response );
										} )
										.catch( error => this.handleError( error ) );
	}

	update( user: User ): Promise<void | any> {
		return this.http.put( this.authUrl + '/signup' + this.getToken(), user )
										.toPromise()
										.then( response => {
											this.onUpdate( response );
										} )
										.catch( error => this.handleError( error ) );
	}

	login( user: User ): Promise<void | any> {
		return this.http.post( this.authUrl + '/login', user )
										.toPromise()
										.then( response => {
											this.onSuccess( response );
										} )
										.catch( error => this.handleError( error ) );
	}

	getLoggedUser(): Promise<void | any> {
		return this.http.get( this.authUrl + this.getToken() )
										.toPromise()
										.catch( error => this.handleError( error ) );
	}

	logout() {
		localStorage.clear();
	}

	isLoggedIn() {
		return !!( localStorage.token );
	}

	getUser() {
		return localStorage.user;
	}

	private onSuccess( response: Response ) {
		var data = response.json();
		localStorage.setItem( 'token', data.token );
		localStorage.setItem( 'user', data.user );
		this.router.navigate( ['/admin', 'tournaments'] );
	}

	private onUpdate( response: Response ) {
		var data = response.json();
		localStorage.setItem( 'token', data.token );
		localStorage.setItem( 'user', data.user );
		this.responseService.handleResponse( response );
	}

	private getToken() {
		const token = localStorage.getItem( 'token' ) ? 
									'?token=' + localStorage.getItem( 'token' ) :
									'';
		return token;
	}

	private handleError( error: any ) {
		this.errorService.handleError( error );
		if ( error.status == 400 || error.status == 400 ) {
			this.router.navigateByUrl( '/admin/login' );
		}
	}
}
