import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-bracket',
  templateUrl: './bracket.component.html',
  styleUrls: ['./bracket.component.css']
})
export class BracketComponent implements OnInit {
	url: string;
	safeUrl: SafeResourceUrl;
	private sub: any;

  constructor( private route: ActivatedRoute, public sanitizer: DomSanitizer ) { }

  ngOnInit() {
  	this.sub = this.route.params.subscribe( params => {
  		this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl( 'https://challonge.com/' + params['url'] + '/module' );
  	} );
  }
}
