import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import { Tournament } from './tournament';
import { Match } from './match';

@Injectable()
export class TournamentService {
	private tournamentUrl = '/api/tournaments';
	tournamentsEdit = new EventEmitter<Tournament[]>();

  constructor( private http: Http ) { }

  getTournaments(): Promise<void | Tournament[]> {
  	return this.http.get( this.tournamentUrl )
										.toPromise()
										.then( ( response: any ) => {
											this.tournamentsEdit.emit( response.json() as Tournament[] );
										} )
										.catch( this.handleError );
  }

  updateMatch( match: Match ): Promise<void | Tournament[]> {
  	return this.http.post( this.tournamentUrl + '/match' + this.getToken(), match )
										.toPromise()
										.then( ( response: any ) => {
											this.tournamentsEdit.emit( response.json() as Tournament[] );
										} )
										.catch( this.handleError );
  }

  private handleError( error: any ) {
  	let errMsg = ( error.message ) ? error.message : 
  	error.status ? `${ error.status } - ${ error.statusText }` : 'Server error';
  	console.log( errMsg );
  }

  private getToken() {
    const token = localStorage.getItem( 'token' ) ? 
                  '?token=' + localStorage.getItem( 'token' ) :
                  '';
    return token;
  }
}
