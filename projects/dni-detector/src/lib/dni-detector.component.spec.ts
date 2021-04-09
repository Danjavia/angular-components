import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DniDetectorComponent } from './dni-detector.component';

describe('DniDetectorComponent', () => {
  let component: DniDetectorComponent;
  let fixture: ComponentFixture<DniDetectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DniDetectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DniDetectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
