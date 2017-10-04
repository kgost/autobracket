import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import { Tournament } from './tournament';
import { Match } from './match';
import { ErrorService } from '../error/error.service';

@Injectable()
export class TournamentService {
	private tournamentUrl = '/api/tournaments';
	tournamentsEdit = new EventEmitter<Tournament[]>();

  constructor( private http: Http, private errorService: ErrorService ) { }

  getTournaments( account: string ): Promise<void | Tournament[]> {
  	return this.http.get( this.tournamentUrl + '/' + account )
										.toPromise()
										.then( ( response: any ) => {
											this.tournamentsEdit.emit( response.json() as Tournament[] );
										} )
										.catch( error => this.handleError( error ) );
  }

  updateMatch( tournamentId: string, match: Match ): Promise<void | Tournament[]> {
  	return this.http.put( this.tournamentUrl + '/' + tournamentId + '/matches/' + match._id + this.getToken(), match )
										.toPromise()
										.then( ( response: any ) => {
											console.log( response );
											this.tournamentsEdit.emit( response.json() as Tournament[] );
										} )
										.catch( error => this.handleError( error ) );
  }

	moveToStream( tournamentId: string, matchId: string ): Promise<void | Tournament[]> {
		return this.http.get( this.tournamentUrl + '/' + tournamentId + '/stream/' + matchId + this.getToken() )
										.toPromise()
										.then( ( response: any ) => {
											this.tournamentsEdit.emit( response.json() as Tournament[] );
										} )
										.catch( error => this.handleError( error ) );
	}

  removeFromStream( tournamentId: string, matchId: string ): Promise<void | Tournament[]> {
  	return this.http.delete( this.tournamentUrl + '/' + tournamentId + '/stream/' + matchId + this.getToken() )
										.toPromise()
										.then( ( response: any ) => {
											this.tournamentsEdit.emit( response.json() as Tournament[] );
										} )
										.catch( error => this.handleError( error ) );
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
