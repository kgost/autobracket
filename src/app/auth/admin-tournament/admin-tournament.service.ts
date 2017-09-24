import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import { ErrorService } from '../../error/error.service';
import { ChallongeAuth } from './challonge-auth';
import { AdminTournament } from './admin-tournament';


@Injectable()
export class AdminTournamentService {
	private adminUrl = '/api/admin/';

  constructor( private http: Http, private errorService: ErrorService ) { }

	getTournaments( auth: ChallongeAuth ): Promise<void | AdminTournament[]> {
		return this.http.post( this.adminUrl + 'getTournaments' + this.getToken(), auth )
										.toPromise()
										.then( response => response.json() as AdminTournament[] )
										.catch( error => this.handleError( error ) );
	}

	startTournament( tournament: AdminTournament, auth: ChallongeAuth ): Promise<void | any> {
  	return this.http.post( this.adminUrl + 'startTournament' + this.getToken(), { tournament: tournament, auth: auth } )
  									.toPromise()
  									.then( response => response.json() )
										.catch( error => this.handleError( error ) );
  }

	restartTournament( tournament: AdminTournament, auth: ChallongeAuth ): Promise<void | any> {
  	return this.http.post( this.adminUrl + 'restartTournament' + this.getToken(), { tournament: tournament, auth: auth } )
  									.toPromise()
  									.then( response => response.json() )
										.catch( error => this.handleError( error ) );
  }

  private handleError( error: any ) {
		this.errorService.handleError( JSON.parse( error._body ).error.message );
  }

  private getToken() {
    const token = localStorage.getItem( 'token' ) ? 
                  '?token=' + localStorage.getItem( 'token' ) :
                  '';
    return token;
  }
}
