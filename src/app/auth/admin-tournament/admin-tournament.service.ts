import { Injectable } from '@angular/core';
import { ChallongeAuth } from './challonge-auth';
import { AdminTournament } from './admin-tournament';
import { Http, Response } from '@angular/http';
import { ErrorService } from '../../error/error.service';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class AdminTournamentService {
	private adminUrl = '/api/admin/';

  constructor( private http: Http, private errorService: ErrorService ) { }

	getTournaments( auth: ChallongeAuth ): Promise<void | AdminTournament[]> {
		return this.http.post( this.adminUrl + 'getTournaments', auth )
										.toPromise()
										.then( response => response.json() as AdminTournament[] )
										.catch( error => this.handleError( error ) );
	}

  private handleError( error: any ) {
		this.errorService.handleError( JSON.parse( error._body ).error.message );
  }
}
