import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTournamentListComponent } from './admin-tournament-list.component';

describe('AdminTournamentListComponent', () => {
  let component: AdminTournamentListComponent;
  let fixture: ComponentFixture<AdminTournamentListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminTournamentListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminTournamentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
