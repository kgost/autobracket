import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class ErrorService {
	errorOccured = new EventEmitter<string>();

  constructor() { }

  handleError( error: string ) {
  	this.errorOccured.emit( error );
  }
}
