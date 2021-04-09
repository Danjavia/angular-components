import {EventEmitter, Injectable } from '@angular/core';
import * as faceapi from 'face-api.js';

@Injectable({
  providedIn: 'root'
})
export class FaceDetectorService {

  public globalFace: any;
  callbackModels: EventEmitter<any> = new EventEmitter<any>();


  private modelsToLoad = [
    faceapi.nets.ssdMobilenetv1.loadFromUri('assets/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('assets/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('assets/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('assets/models'),
  ];

  constructor() {
    this.globalFace = faceapi;
    this.loadModels();
  }

  public loadModels = () => {
    Promise.all(this.modelsToLoad).then(res => {
      this.callbackModels.emit(true);
    });
  }
}
