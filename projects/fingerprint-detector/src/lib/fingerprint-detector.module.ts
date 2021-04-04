import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FingerprintDetectorComponent } from './fingerprint-detector.component';

declare global {
  interface Window {
    handpose: any; Hands: any; Camera: any; drawConnectors: any; HAND_CONNECTIONS: any; drawLandmark: any;
    drawLandmarks: any; lerp: any; ImageCapture: any;
  }
}

@NgModule({
  declarations: [FingerprintDetectorComponent],
  imports: [
    CommonModule
  ],
  exports: [FingerprintDetectorComponent]
})
export class FingerprintDetectorModule { }
