import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaceDetectorComponent } from './face-detector.component';

describe('FaceDetectorComponent', () => {
  let component: FaceDetectorComponent;
  let fixture: ComponentFixture<FaceDetectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FaceDetectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FaceDetectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
