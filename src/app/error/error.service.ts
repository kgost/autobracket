import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class ErrorService {
	errorOccured = new EventEmitter<string>();

  constructor() { }

	handleError( error: any ) {
		this.errorOccured.emit( JSON.parse( error._body ).error );
	}
}
