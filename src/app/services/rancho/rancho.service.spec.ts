import { TestBed } from '@angular/core/testing';

import { RanchoService } from './rancho.service';

describe('RanchoService', () => {
  let service: RanchoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RanchoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
