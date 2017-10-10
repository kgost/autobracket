import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class ResponseService {
	responseOccured = new EventEmitter<string>();

  constructor() { }

  handleResponse( response: any ) {
  	response = response.json();
  	this.responseOccured.emit( response.message );
  }
}
