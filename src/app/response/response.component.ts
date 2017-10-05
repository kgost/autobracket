import { Component, OnInit } from '@angular/core';

import { ResponseService } from './response.service';

@Component({
  selector: 'app-response',
  templateUrl: './response.component.html',
  styleUrls: ['./response.component.css']
})
export class ResponseComponent implements OnInit {
	public response: string;
	public display: string;

  constructor( private responseService: ResponseService ) { }

  onDismiss() {
  	this.display = 'none';
  }

  ngOnInit() {
	  this.response = this.responseService.responseOccured.subscribe(
	  	( response: any ) => {
	  		this.response = response;
	  		this.display = 'block'
	  	}
	  );
	  this.display = 'none';
  }
}
