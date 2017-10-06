import { Component, OnInit } from '@angular/core';
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
	private sub: any;

  constructor( private route: ActivatedRoute, private authService: AuthService, private tournamentService: TournamentService ) { }

  ngOnInit() {
  	this.sub = this.route.params.subscribe( params => {
	  	this.tournaments = this.tournamentService.tournamentsEdit.subscribe(
	  		( tournaments: Tournament[] ) => {
	  			var temp = [];
	  			var tempTourns = [];
					tournaments.forEach( function( tournament, index ) {
						temp.push( tournament );
						if ( index % 2 != 0 ) {
							tempTourns.push( temp );
							temp = [];
						}
					} );
					tempTourns.push( temp );
					this.tournaments = tempTourns;
	  		}
	  	);
	  	this.tournamentService.getTournaments( params['account'] );
  	} );
  }

  isLoggedIn() {
  	return this.authService.isLoggedIn();
  }
}
