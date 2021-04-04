import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FingerprintDetectorComponent } from './fingerprint-detector.component';

describe('FingerprintDetectorComponent', () => {
  let component: FingerprintDetectorComponent;
  let fixture: ComponentFixture<FingerprintDetectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FingerprintDetectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FingerprintDetectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
