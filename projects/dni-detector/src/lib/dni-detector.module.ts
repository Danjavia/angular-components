import { NgModule } from '@angular/core';
import { DniDetectorComponent } from './dni-detector.component';
import {CommonModule} from '@angular/common';



@NgModule({
  declarations: [DniDetectorComponent],
  imports: [
    CommonModule
  ],
  exports: [DniDetectorComponent]
})
export class DniDetectorModule { }
