import { NgModule } from '@angular/core';
import { FaceDetectorComponent } from './face-detector.component';
import {CommonModule} from '@angular/common';



@NgModule({
  declarations: [FaceDetectorComponent],
  imports: [
    CommonModule
  ],
  exports: [FaceDetectorComponent]
})
export class FaceDetectorModule { }
