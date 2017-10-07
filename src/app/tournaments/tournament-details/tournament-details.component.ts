import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';

import { Tournament } from '../tournament';
import { TournamentService } from '../tournament.service';
import { Match } from '../match';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'tournament-details',
  templateUrl: './tournament-details.component.html',
  styleUrls: ['./tournament-details.component.css']
})
export class TournamentDetailsComponent implements OnInit {
	myForm: FormGroup;
	match: Match;

	@Input()
	tournament: Tournament;

	@Input()
	updateHandler: Function;

  constructor( private authService: AuthService, private tournamentService: TournamentService ) { }

  ngOnInit() {
  	this.myForm = new FormGroup({
  		player1: new FormControl( null, Validators.required ),
  		player2: new FormControl( null, Validators.required )
  	});
  }

  select( match: Match ) {
  	this.match = match;
  }

  stream( match: Match ) {
    for ( var i = 0; i < this.tournament.liveMatches.length; i ++ ) {
      if ( this.tournament.liveMatches[i]._id == match._id ) {
        this.tournamentService.moveToStream( this.tournament._id, match._id );
        break;
      }
    }
    
  	for ( var i = 0; i < this.tournament.matches.length; i ++ ) {
  		if ( this.tournament.matches[i]._id == match._id ) {
  			this.tournamentService.moveToStream( this.tournament._id, match._id );
	  		break;
  		}
  	}
  }

  unStream( match: Match ) {
  	for ( var i = 0; i < this.tournament.streamMatches.length; i ++ ) {
  		if ( this.tournament.streamMatches[i]._id == match._id ) {
  			this.tournamentService.removeFromStream( this.tournament._id, match._id );
	  		break;
  		}
  	}
  }

  onSubmit() {
  	if ( this.myForm.value.player1 !== this.myForm.value.player2 ) {
  		this.match.scores_csv = this.myForm.value.player1 + '-' + this.myForm.value.player2;
  		if ( this.myForm.value.player1 > this.myForm.value.player2 ) {
  			this.match.winner_id = this.match.player1.id;
  		} else if ( this.myForm.value.player1 < this.myForm.value.player2 ) {
  			this.match.winner_id = this.match.player2.id;
  		}
	  	this.myForm.reset();
	  	this.tournamentService.updateMatch( this.tournament._id, this.match );
  	}
  }

  isLoggedIn() {
  	return this.authService.isLoggedIn();
  }
}
