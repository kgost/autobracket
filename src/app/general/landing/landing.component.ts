import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {
	private wiiDate: Date;
	private melDate: Date;
	private days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
	private months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  constructor() { }

  ngOnInit() {
  	var wiiPast = Math.ceil( ( new Date().getDate() - new Date( '10-08-2017' ).getDate() ) / 14 );
  	var melPast = Math.ceil( ( new Date().getDate() - new Date( '10-01-2017' ).getDate() ) / 14 );
  	this.wiiDate = new Date( new Date().setDate( new Date( '10-08-2017' ).getDate() + wiiPast * 14 ) );
  	this.melDate = new Date( new Date().setDate( new Date( '10-01-2017' ).getDate() + melPast * 14 ) );
  }
}
