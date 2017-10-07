import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';

import { Tournament } from './tournament';
import { Match } from './match';
import { MainService } from '../general/main.service';

@Injectable()
export class TournamentService {
	private socket;
	private tournamentUrl = '/api/tournaments';
	tournamentsEdit = new EventEmitter<Tournament[]>();

  constructor( private http: Http, private mainService: MainService ) { }

  getInitialTournaments( account: string ): Promise<void | Tournament[]> {
		return this.http.get( this.tournamentUrl + '/' + account )
										.toPromise()
										.then( ( response: any ) => {
											this.tournamentsEdit.emit( response.json() as Tournament[] );
										} )
										.catch( error => this.handleError( error ) );
  }

  getTournaments( account: string ) {
		let observable = new Observable( observer => {
			this.socket = io();
			this.socket.on( 'tournaments-' + account, ( data ) => {
				this.tournamentsEdit.emit( data as Tournament[] );
			} );

			return() => {
				this.socket.disconnect();
			};
		} );

		return observable;
	}

  updateMatch( tournamentId: string, match: Match ): Promise<void> {
  	return this.http.put( this.tournamentUrl + '/' + tournamentId + '/matches/' + match._id + this.getToken(), match )
										.toPromise()
										.catch( error => this.handleError( error ) );
  }

	moveToStream( tournamentId: string, matchId: string ): Promise<void> {
		return this.http.get( this.tournamentUrl + '/' + tournamentId + '/stream/' + matchId + this.getToken() )
										.toPromise()
										.catch( error => this.handleError( error ) );
	}

  removeFromStream( tournamentId: string, matchId: string ): Promise<void> {
  	return this.http.delete( this.tournamentUrl + '/' + tournamentId + '/stream/' + matchId + this.getToken() )
										.toPromise()
										.catch( error => this.handleError( error ) );
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
