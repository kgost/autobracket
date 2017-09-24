import { Injectable, EventEmitter } from '@angular/core';

import { Match } from './match';

@Injectable()
export class MatchService {
	matchIsEdit = new EventEmitter<Match>();

  constructor() { }

  selectMatch( match: Match ) {
  	this.matchIsEdit.emit( match );
  }
}
