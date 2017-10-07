import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class ResponseService {
	responseOccured = new EventEmitter<string>();

  constructor() { }

  handleResponse( response: any ) {
  	this.responseOccured.emit( JSON.parse( response._body ).message );
  }
}
