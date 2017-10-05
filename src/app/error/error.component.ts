import { Component, OnInit } from '@angular/core';

import { ErrorService } from './error.service';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent implements OnInit {
	public error: string;
	public display: string;

  constructor( private errorService: ErrorService ) { }

  onDismiss() {
  	this.display = 'none';
  }

  ngOnInit() {
	  this.error = this.errorService.errorOccured.subscribe(
	  	( error: any ) => {
	  		this.error = error;
	  		this.display = 'block'
	  	}
	  );
	  this.display = 'none';
  }
}
