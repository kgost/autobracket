import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class ErrorService {
	errorOccured = new EventEmitter<string>();

  constructor() { }

	handleError( error: any ) {
		error = error.json();
		this.errorOccured.emit( error.error );
	}
}
