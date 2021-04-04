import { TestBed } from '@angular/core/testing';

import { FingerprintDetectorService } from './fingerprint-detector.service';

describe('FingerprintDetectorService', () => {
  let service: FingerprintDetectorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FingerprintDetectorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
