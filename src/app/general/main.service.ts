import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { ErrorService } from '../error/error.service';
import { ResponseService } from '../response/response.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class MainService {
  constructor( private authService: AuthService, private router: Router, private errorService: ErrorService, private responseService: ResponseService ) { }

	handleError( error: any ) {
		this.errorService.handleError( error );
		if ( error.status == 401 ) {
			this.authService.logout();
			this.router.navigateByUrl( '/admin/login' );
		}
	}

	handleResponse( response: any ) {
		this.responseService.handleResponse( response );
	}
}
