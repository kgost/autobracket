import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import { ErrorService } from '../../error/error.service';
import { ResponseService } from '../../response/response.service';
import { ChallongeAuth } from './challonge-auth';
import { AdminTournament } from './admin-tournament';


@Injectable()
export class AdminTournamentService {
	private adminUrl = '/api/admin/tournaments';

  constructor( private responseService: ResponseService, private http: Http, private errorService: ErrorService ) { }

	getTournaments(): Promise<void | AdminTournament[]> {
		return this.http.get( this.adminUrl + this.getToken() )
										.toPromise()
										.then( response => response.json() as AdminTournament[] )
										.catch( error => this.handleError( error ) );
	}

	startTournament( tournament: AdminTournament ): Promise<void | any> {
		return this.http.post( this.adminUrl + '/' + tournament.id + this.getToken(), tournament )
										.toPromise()
										.then( response => {
											this.handleResponse( response );
										} )
										.catch( error => this.handleError( error ) );
	}

	private handleResponse( response: any ) {
		this.responseService.handleResponse( JSON.parse( response._body ).message );
	}

  private handleError( error: any ) {
		this.errorService.handleError( JSON.parse( error._body ).error );
  }

  private getToken() {
    const token = localStorage.getItem( 'token' ) ? 
                  '?token=' + localStorage.getItem( 'token' ) :
                  '';
    return token;
  }
}
