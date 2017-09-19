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
  	this.adminTournamentService.getTournaments( auth )
  			.then( ( adminTournaments: AdminTournament[] ) => {
  				this.adminTournaments = adminTournaments;
  			} );
  }
}
