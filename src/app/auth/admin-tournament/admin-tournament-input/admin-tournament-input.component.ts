import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { AdminTournament } from '../admin-tournament';
import { ChallongeAuth } from '../challonge-auth';
import { AdminTournamentService } from '../admin-tournament.service';

@Component({
	selector: 'admin-tournament-input',
	templateUrl: './admin-tournament-input.component.html',
	styleUrls: ['./admin-tournament-input.component.css']
})
export class AdminTournamentInputComponent implements OnInit {
	myForm: FormGroup;

	@Input()
	tournament: AdminTournament;

	@Input()
	startHandler: Function;
	@Input()
	restartHandler: Function;

	constructor( private adminTournamentService: AdminTournamentService ) { }

	ngOnInit() {
		this.myForm = new FormGroup({
			setups: new FormControl( null, Validators.required ),
			streams: new FormControl( null, Validators.required )
		});
	}

	onSubmit() {
		this.tournament.setups = this.myForm.value.setups;
		this.tournament.streams = this.myForm.value.streams;
		this.myForm.reset();
		this.startHandler( this.tournament );
	}
}
