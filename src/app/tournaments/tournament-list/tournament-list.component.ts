import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgClass } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { AuthService } from '../../auth/auth.service';
import { TournamentService } from '../tournament.service';
import { Tournament } from '../tournament';

@Component({
  selector: 'app-tournament-list',
  templateUrl: './tournament-list.component.html',
  styleUrls: ['./tournament-list.component.css'],
  providers: [TournamentService]
})
export class TournamentListComponent implements OnInit {
	tournaments: Tournament[][];
	connection;
	private sub: any;

  constructor( private route: ActivatedRoute, private authService: AuthService, private tournamentService: TournamentService ) { }

  ngOnInit() {
  	this.sub = this.route.params.subscribe( params => {
	  	this.connection = this.tournamentService.tournamentsEdit.subscribe( ( tournaments: Tournament[] ) => {
				var temp = [];
				var tempTourns = [];
				tournaments.forEach( function( tournament, index ) {
					temp.push( tournament );
					if ( index % 2 != 0 ) {
						tempTourns.push( temp );
						temp = [];
					}
				} );

				if ( temp.length > 0 ) {
					tempTourns.push( temp );
				}
				this.tournaments = tempTourns;
  		});
			this.tournamentService.getInitialTournaments( params['account'] )
					.then( response => {
						this.connection = this.tournamentService.getTournaments( params['account'] )
								.subscribe( ( tournaments: Tournament[] ) => {
									var temp = [];
									var tempTourns = [];
									tournaments.forEach( function( tournament, index ) {
										temp.push( tournament );
										if ( index % 2 != 0 ) {
											tempTourns.push( temp );
											temp = [];
										}
									} );
									
									if ( temp.length > 0 ) {
										tempTourns.push( temp );
									}
									this.tournaments = tempTourns;
								} );
					} );
  	} );
  }

	ngOnDestroy() {
		this.connection.unsubscribe();
	}

  isLoggedIn() {
  	return this.authService.isLoggedIn();
  }
}
