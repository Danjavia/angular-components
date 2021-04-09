import {EventEmitter, Injectable } from '@angular/core';
import {FaceApiService} from './face-api.service';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class VideoPlayerService {

  callbackAI: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private faceApiService: FaceApiService,
  ) {

  }

  getLandMark = async (videoElement: any) => {
    try {
      const { globalFace } = this.faceApiService;
      const {videoWidth, videoHeight } = videoElement.nativeElement;
      const displaySize = {width: videoWidth, height: videoHeight};

      const faceDetections = await globalFace.detectAllFaces(videoElement.nativeElement)
        .withFaceLandmarks();
      // .withFaceExpressions();

      const landMarks = faceDetections[0].landmarks || null;
      const eyeLeft = landMarks.getLeftEye();
      const eyeRight = landMarks.getRightEye();
      const eyes = {
        left: [_.head(eyeLeft), _.last(eyeLeft)],
        right: [_.head(eyeRight), _.last(eyeRight)],
      };
      const resizedDetections = globalFace.resizeResults(faceDetections, displaySize);

      this.callbackAI.emit({
        resizedDetections,
        displaySize,
        eyes,
        error: false,
      });
    } catch (err) {
      console.log(err.message);
      this.callbackAI.emit({
        error: true,
      });
    }
  }
}
