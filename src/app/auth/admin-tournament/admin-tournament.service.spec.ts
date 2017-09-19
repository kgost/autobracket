import { TestBed, inject } from '@angular/core/testing';

import { AdminTournamentService } from './admin-tournament.service';

describe('AdminTournamentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminTournamentService]
    });
  });

  it('should be created', inject([AdminTournamentService], (service: AdminTournamentService) => {
    expect(service).toBeTruthy();
  }));
});
