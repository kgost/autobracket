import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  public location = '';

  constructor( private router: Router, private authService: AuthService ) { }

  isLoggedIn() {
  	return this.authService.isLoggedIn();
  }

  getUser() {
  	return this.authService.getUser();
  }

  ngOnInit() {
    this.router.events.subscribe( ( val ) => this.location = this.router.url );
  }

}
