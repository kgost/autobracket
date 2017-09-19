import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTournamentInputComponent } from './admin-tournament-input.component';

describe('AdminTournamentInputComponent', () => {
  let component: AdminTournamentInputComponent;
  let fixture: ComponentFixture<AdminTournamentInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminTournamentInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminTournamentInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
