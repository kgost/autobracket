import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import { MainService } from '../../general/main.service';
import { ChallongeAuth } from './challonge-auth';
import { AdminTournament } from './admin-tournament';


@Injectable()
export class AdminTournamentService {
	private adminUrl = '/api/admin/tournaments';

  constructor( private mainService: MainService, private http: Http ) { }

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
		this.mainService.handleResponse( response );
	}

  private handleError( error: any ) {
		this.mainService.handleError( error );
  }

  private getToken() {
    const token = localStorage.getItem( 'token' ) ? 
                  '?token=' + localStorage.getItem( 'token' ) :
                  '';
    return token;
  }
}
