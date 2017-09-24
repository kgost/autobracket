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
	myForm: FormGroup;
	adminTournaments: AdminTournament[];
	selectedTournament: AdminTournament;
	auth: ChallongeAuth;

  constructor( private adminTournamentService: AdminTournamentService ) { }

  ngOnInit() {
  	this.myForm = new FormGroup({
  		username: new FormControl( null, Validators.required ),
  		key: new FormControl( null, Validators.required )
  	});
  }

  onSubmit() {
  	const auth = new ChallongeAuth(
  		this.myForm.value.username,
  		this.myForm.value.key
		);
		this.auth = auth;
		this.selectedTournament = null;
		this.adminTournaments = null;
  	this.adminTournamentService.getTournaments( auth )
  			.then( ( adminTournaments: AdminTournament[] ) => {
  				this.adminTournaments = adminTournaments;
  			} );
  }

  selectTournament( tournament: AdminTournament ) {
  	this.selectedTournament = tournament;
  }

  startTournament( tournament: AdminTournament, auth: ChallongeAuth ) {
  	this.adminTournamentService.startTournament( tournament, auth )
  			.then( () => tournament.started = true );
  }

  restartTournament( tournament: AdminTournament, auth: ChallongeAuth ) {
  	this.adminTournamentService.restartTournament( tournament, auth );
  }
}
