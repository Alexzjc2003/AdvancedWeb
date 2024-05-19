import { TestBed } from '@angular/core/testing';

import { CarspeedService } from './carspeed.service';

describe('CarspeedService', () => {
  let service: CarspeedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CarspeedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
