import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { AdminTournamentService } from '../admin-tournament.service';
import { ChallongeAuth } from '../challonge-auth';
import { AdminTournament } from '../admin-tournament';

@Component({
  selector: 'app-admin-tournament-list',
  templateUrl: './admin-tournament-list.component.html',
  styleUrls: ['./admin-tournament-list.component.css'],
  providers: [AdminTournamentService]
})
export class AdminTournamentListComponent implements OnInit {
	adminTournaments: AdminTournament[];
	selectedTournament: AdminTournament;

  constructor( private adminTournamentService: AdminTournamentService ) { }

	ngOnInit() {
		this.adminTournamentService.getTournaments()
				.then( ( adminTournaments: AdminTournament[] ) => {
					this.adminTournaments = adminTournaments;
				} );
	}

  selectTournament( tournament: AdminTournament ) {
  	this.selectedTournament = tournament;
  }

  startTournament( tournament: AdminTournament ) {
  	this.adminTournamentService.startTournament( tournament );
  }
}
