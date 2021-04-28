// import { DOCUMENT } from '@angular/common';
import {Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, Renderer2, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import { FaceDetectorService } from './face-detector.service';
import { VideoPlayerService } from './video-player.service';

@Component({
  selector: 'lib-face-detector',
  templateUrl: './face-detector.component.html',
  styleUrls: ['./face-detector.component.scss']
})
export class FaceDetectorComponent implements OnInit {

  public currentStream: any;
  public videoDimensions: any;

  // Video player
  stream: any;
  width: number;
  height: number;
  @Input() placeholder: string;
  @Input() selector: any;
  @Input() counter: number;
  @Output() takePhoto: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('videoElement') videoElement: ElementRef;
  @ViewChild('canvas', {static: false}) canvas: ElementRef<HTMLCanvasElement>;
  listEvents: Array<any> = [];
  modelsReady: boolean;
  overCanvas: any;
  count: number;
  photo: string;
  private smileValidation = false;

  constructor(
    private renderer2: Renderer2,
    private elementRef: ElementRef,
    private faceApiService: FaceDetectorService,
    private videoPlayerService: VideoPlayerService,
    private router: Router,
    // @Inject(DOCUMENT) private document: Document,
  ) {
    this.count = this.counter;
  }

  ngOnInit(): void {
    this.checkMediaSources();
    this.getSizeCam();
    this.listenerEvents();
  }

  checkMediaSources = (): void => {
    if (navigator && navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true,
      }).then(stream => {
        this.currentStream = stream;
        this.stream = this.currentStream;
      }).catch(e => console.log('The user has been denied permission'));
    } else {
      console.log('No media exists');
    }
  }

  getSizeCam = (): void => {
    let elementCam: HTMLElement;
    // @ts-ignore
    elementCam = document.querySelector(this.selector);
    const { width, height } = elementCam.getBoundingClientRect();
    this.videoDimensions = { width, height };
    this.width = width;
    this.height = height;
  }

  // Video player functions
  listenerEvents = () => {
    const observer$ = this.faceApiService.callbackModels.subscribe(res => {
      // models are ready here
      this.modelsReady = true;
      this.checkFace();
    });

    const observer2$ = this.videoPlayerService.callbackAI
      .subscribe(({resizedDetections, displaySize, expressions, eyes, error}) => {
        if (!error) {
          resizedDetections = resizedDetections || null;

          if (resizedDetections) {
            this.drawFace(resizedDetections, displaySize);
            // this.count--;

            if (resizedDetections.expressions.neutral < 0.6) {
              this.smileValidation = true;
            }

            if (resizedDetections.expressions.neutral > 0.95 && this.smileValidation) {
              this.count --;
            }

            if (this.count === 0) {
              this.snapshot();
            }
          }
        } else {
          this.count = this.counter;
        }
      });

    this.listEvents = [observer$, observer2$];
  }

  drawFace = (resizedDetections, displaySize) => {
    const {globalFace} = this.faceApiService;
    this.overCanvas.getContext('2d').clearRect(0, 0, displaySize.width, displaySize.height);
    // globalFace.draw.drawDetections(this.overCanvas, resizedDetections);
  }

  checkFace = () => {
    setInterval(async () => {
      await this.videoPlayerService.getLandMark(this.videoElement);
    }, 1000);
  }

  loadedMetaData(): void {
    this.videoElement.nativeElement.play();
  }

  playListener(): void {
    const {globalFace} = this.faceApiService;
    this.overCanvas = globalFace.createCanvasFromMedia(this.videoElement.nativeElement);
    this.canvas.nativeElement = globalFace.createCanvasFromMedia(this.videoElement.nativeElement);
    this.renderer2.setProperty(this.overCanvas, 'id', 'new-over-canvas');
    this.renderer2.setProperty(this.canvas.nativeElement, 'width', this.width);
    this.renderer2.setProperty(this.canvas.nativeElement, 'height', this.height);
    this.renderer2.setStyle(this.canvas.nativeElement, 'width', `${this.width}px`);
    this.renderer2.setStyle(this.canvas.nativeElement, 'height', `${this.height}px`);
  }

  async snapshot(): Promise<void> {
    this.playListener();
    this.overCanvas.getContext('2d').drawImage(this.canvas.nativeElement.getContext('2d').canvas, 0, 0, this.width, this.height);
    this.photo = this.overCanvas.toDataURL();
    console.log(this.photo);
    this.takePhoto.emit({
      image: this.photo,
    });
    // await this.router.navigateByUrl('/funnel/biometric/last?selfie=ok');
  }
}
