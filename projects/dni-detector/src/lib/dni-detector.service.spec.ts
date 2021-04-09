import { TestBed } from '@angular/core/testing';

import { DniDetectorService } from './dni-detector.service';

describe('DniDetectorService', () => {
  let service: DniDetectorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DniDetectorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
