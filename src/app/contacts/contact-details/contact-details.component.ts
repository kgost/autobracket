import { Component, OnInit, Input } from '@angular/core';
import { Contact } from '../contact';
import { ContactService } from '../contact.service';

@Component({
  selector: 'app-contact-details',
  templateUrl: './contact-details.component.html',
  styleUrls: ['./contact-details.component.css']
})
export class ContactDetailsComponent implements OnInit {
	@Input()
	contact: Contact;

	@Input()
	createHandler: Function;
	@Input()
	updateHandler: Function;
	@Input()
	deleteHandler: Function;

  constructor( private contactService: ContactService ) { }

  createContact( contact: Contact ) {
  	this.contactService.createContact( contact ).then( ( newContact: Contact ) => {
  		this.createHandler( newContact );
  	} );
  }

  updateContact( contact: Contact ): void {
  	this.contactService.updateContact( contact ).then( ( updateContact: Contact ) => {
  		this.updateHandler( updateContact );
  	} );
  }

  deleteContact( contactId: String ): void {
  	this.contactService.deleteContact( contactId ).then( ( deletedContactId: String ) => {
  		this.deleteHandler( deletedContactId );
  	} );
  }

  ngOnInit() {
  }
}
