import {Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2, ViewChild} from '@angular/core';
import {ActivatedRoute, Router } from '@angular/router';
import { DniDetectorService } from './dni-detector.service';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

@Component({
  selector: 'lib-dni-detector',
  templateUrl: './dni-detector.component.html',
  styleUrls: ['./dni-detector.component.scss']
})
export class DniDetectorComponent implements OnInit, OnDestroy {

  public currentStream: any;
  public videoDimensions: any;

  // video player
  stream: any;
  width: number;
  height: number;
  @Input() selector: string;
  @Input() format: string; // (horizontal|vertical)
  @Input() placeholder: string; // path to placeholder image
  @Input() side: string;
  @Output() takePhoto: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('dniVideoElement') dniVideoElement: ElementRef;
  @ViewChild('canvas', {static: false}) canvas: ElementRef<HTMLCanvasElement>;
  listEvents: Array<any> = [];
  modelsReady: boolean;
  overCanvas: any;
  count = 2;
  photo: string;
  classifications: any = [];
  type: string;

  constructor(
    private renderer2: Renderer2,
    private elementRef: ElementRef,
    private dniService: DniDetectorService,
    private router: Router,
    private route: ActivatedRoute,
    // @Inject(DOCUMENT) private document: Document,
  ) {
    this.side = this.route.snapshot.queryParams.side || this.side;
  }

  ngOnInit(): void {
    this.checkMediaSources();
    this.getSizeCam();

    this.listenerEvents();
  }

  ngOnDestroy(): void {
    this.listEvents.forEach(e => e.unsubscribe());
  }

  checkMediaSources = (): void => {
    if (navigator && navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'environment',
        },
      }).then(stream => {
        this.currentStream = stream;
        this.stream = this.currentStream;
      }).catch(e => console.log('The user has been denied permission'));
    } else {
      console.log('No media exists');
    }
  }

  getSizeCam = (): void => {
    const elementCam: HTMLElement = document.querySelector(this.selector);
    const { width, height } = elementCam.getBoundingClientRect();
    this.videoDimensions = { width, height: height > 0 ? height : null};
    this.width = width;
    this.height = height;
  }

  listenerEvents(): void {
    try {
      this.predictWithCocoModel();
    } catch(e) {
      console.log(e.message);
    }
  }

  // @ts-ignore
  public predictWithCocoModel(): void {
    try {
      console.log('Runs good');
      // @ts-ignore
      cocoSsd.load().then(async (model) => {
        this.modelsReady = true;
        console.log(model);
        setTimeout(async () => await this.detectFrame(this.dniVideoElement.nativeElement, model), 2000);
      });
    } catch (e) {
      console.log(e.message);
    }

  }

  detectFrame = (video, model) => {
    model.detect(video).then(predictions => {
      setTimeout(() => {
        const results = this.renderPredictions(predictions);
        console.log('Detecting....');
        this.onResults(results);
        requestAnimationFrame(() => {
          this.detectFrame(video, model);
        });
      }, 10);
    });
  }

  renderPredictions = predictions => {
    // const canvas = this.canvas.nativeElement;

    // const ctx = canvas.getContext('2d');
    // canvas.width  = 300;
    // canvas.height = 300;
    // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // // Fonts
    // const font = '16px sans-serif';
    // ctx.font = font;
    // ctx.textBaseline = 'top';
    // ctx.drawImage(this.dniVideoElement.nativeElement, 0, 0, 300, 300);
    // predictions.forEach(prediction => {
    //   return prediction.class;
    //   // const x = prediction.bbox[0];
    //   // const y = prediction.bbox[1];
    //   // const width = prediction.bbox[2];
    //   // const height = prediction.bbox[3];
    //   // // Bounding box
    //   // ctx.strokeStyle = '#00FFFF';
    //   // ctx.lineWidth = 2;
    //   // ctx.strokeRect(x, y, width, height);
    //   // // Label background
    //   // ctx.fillStyle = '#00FFFF';
    //   // const textWidth = ctx.measureText(prediction.class).width;
    //   // const textHeight = parseInt(font, 10); // base 10
    //   // ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
    // });
    return predictions[0];
  }

  loadedMetaData(): void {
    this.dniVideoElement.nativeElement.play();
    this.setML();
  }

  playListener(): void {
    console.count('renders');
  }

  async snapshot(result: any): Promise<void> {
    const { bbox } = result;
    console.log(bbox);
    const canvasCtx = this.canvas.nativeElement.getContext('2d');
    const elementCam: HTMLElement = document.querySelector('.video-player');
    const { width, height } = elementCam.getBoundingClientRect();
    canvasCtx.canvas.width = width;
    canvasCtx.canvas.height = height;
    canvasCtx.clearRect(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height);
    console.log(width, height);
    canvasCtx.drawImage(this.dniVideoElement.nativeElement, bbox[0], bbox[1], bbox[2], bbox[3], 0, 0, width, height);
    if (this.side === 'placeholder') {
      // await this.router.navigateByUrl('/funnel/biometric/first?anverse=ok');
    } else {
      // await this.router.navigateByUrl('/funnel/biometric/first?anverse=ok&reverse=ok');
    }

    this.takePhoto.emit({
      image: canvasCtx.canvas.toDataURL('image/jpg'),
    });
  }

  onResults(result): void {
    if (result && this.count > 0) {
      this.type = result.class;
      console.log(result);
      if (this.side === 'placeholder' && ['bench', 'tv', 'book', 'cell phone'].includes(result.class)) {
        console.log('Detectet!!!');
        this.counterDown(result);
      } else if (this.side === 'placeholder-inverse' && ['bench', 'tv', 'book', 'cell phone'].includes(result.class)) {
        console.log('Detectet!!!');
        this.counterDown(result);
      } else {
        this.resetCounter();
      }
    } else {
      console.log('No dni recognized');
      this.resetCounter();
    }
  }

  async setML(): Promise<void> {

    console.log('making magic here');

    try {
      // const modelPromise = await this.dniService.globalCocoSsd.load();
      // const model = await mobileNet.load();
      //
      // console.log(modelPromise, model);

      // this.classifications = await model.classify(this.dniVideoElement.nativeElement);
      // console.log(this.classifications);
    } catch (e) {
      console.log(e);
    }

    // const hands = new window.Hands({locateFile: (file) => {
    //     return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    //   }});
    //
    // hands.setOptions({
    //   maxNumHands: 1,
    //   minDetectionConfidence: 0.3,
    //   minTrackingConfidence: 0.3,
    // });
    //
    // hands.onResults((results) => this.onResults(results));
    //
    // await hands.send({
    //   image: this.dniVideoElement.nativeElement
    // });
    //
    // try {
    //   setInterval(async () => await hands.send({image: this.dniVideoElement.nativeElement}), 1000);
    // } catch (e) {
    //   this.snapshot();
    // }
  }

  private counterDown(result: any): void {
    this.count--;

    if (this.count === 0) {
      this.snapshot(result);
    }
  }

  private resetCounter(): void {
    this.count = 2;
  }

}
