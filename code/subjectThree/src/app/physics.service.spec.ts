import { TestBed } from '@angular/core/testing';

import { PhysicsService } from './physics.service';

describe('PhysicsService', () => {
  let service: PhysicsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PhysicsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
