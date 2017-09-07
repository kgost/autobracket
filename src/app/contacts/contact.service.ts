import { Injectable } from '@angular/core';
import { Contact } from './contact';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class ContactService {
	private contactUrl = '/api/contacts';

  constructor( private http: Http ) { }

  // get( /api/contacts )
  getContacts(): Promise<void | Contact[]> {
  	return this.http.get( this.contactUrl )
										.toPromise()
										.then( response => response.json() as Contact[] )
										.catch( this.handleError );
  }

  // post( /api/contacts )
  createContact( newContact: Contact ): Promise<void | Contact> {
  	return this.http.post( this.contactUrl, newContact )
  									.toPromise()
  									.then( response => response.json() as Contact )
  									.catch( this.handleError );
  }

  // get( /api/contacts/:id ) not used

  // delete( /api/contacts/:id )
  deleteContact( contactId: String ): Promise<void | String> {
  	return this.http.delete( this.contactUrl + '/' + contactId )
  									.toPromise()
  									.then( response => response.json() as String )
  									.catch( this.handleError );
  }

  // put( /api/contacts/:id )
  updateContact( putContact: Contact ): Promise<void | Contact> {
  	return this.http.put( this.contactUrl + '/' + putContact._id, putContact )
  									.toPromise()
  									.then( response => response.json() as Contact )
  									.catch( this.handleError );
  }

  private handleError( error: any ) {
  	let errMsg = ( error.message ) ? error.message : 
  	error.status ? `${ error.status } - ${ error.statusText }` : 'Server error';
  	console.log( errMsg );
  }
}
