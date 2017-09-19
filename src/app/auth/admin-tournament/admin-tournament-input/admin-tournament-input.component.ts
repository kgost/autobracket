import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-admin-tournament-input',
  templateUrl: './admin-tournament-input.component.html',
  styleUrls: ['./admin-tournament-input.component.css']
})
export class AdminTournamentInputComponent implements OnInit {
	myForm: FormGroup;

  constructor() { }

  ngOnInit() {
  }

}
