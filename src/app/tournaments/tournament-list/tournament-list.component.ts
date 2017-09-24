import { Component, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';

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
	tournaments: Tournament[];

  constructor( private authService: AuthService, private tournamentService: TournamentService ) { }

  ngOnInit() {
  	this.tournaments = this.tournamentService.tournamentsEdit.subscribe(
  		( tournaments: Tournament[] ) => {
  			this.tournaments = tournaments;
  		}
  	);
  	this.tournamentService.getTournaments()
  }

  isLoggedIn() {
  	return this.authService.isLoggedIn();
  }
}
