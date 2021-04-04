import { DOCUMENT } from '@angular/common';
import {Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, Renderer2, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'lib-fingerprint-detector',
  template: `
    <div class="face-match">
      <div class="video-player" *ngIf="modelsReady && !photo" [ngClass]="screenshotTaked ? 'shutter-click' : null">
        <video
          #fingerprintVideoElement
          [srcObject]="stream"
          (loadedmetadata)="loadedMetaData()"
          (play)="playListener()"
          [style.width]="width + 'px'"
          [style.height]="height + 'px'"
        ></video>
        <canvas #canvas id="new-over-canvas"></canvas>
        <img *ngIf="message" [src]="'assets/images/funnel/' + hand + '.png'" alt="placeholder" class="placeholder" />
        <div class="text-center text-white face-hint">
          Por favor ubica tu mano <strong class="text-green-100">{{hand === 'left-hand' ? 'izquierda' : 'derecha'}}</strong> en frente de la cámara.
        </div>
        <div class="counter counter-hint" *ngIf="!message">
          <div class="text-center">
            <!--      <h3 class="text-green-100">{{count}}</h3>-->
            <strong class="text-white">Espera un momento mientras tomamos la foto, esto se hará de forma automática</strong>
          </div>
        </div>
        <div class="face-message" *ngIf="message">{{message}} <strong class="text-green-100">{{hand === 'left-hand' ? 'izquierda' : 'derecha'}}</strong> de forma correcta como se indíca en la imagen.</div>
      </div>

      <div class="photo" *ngIf="photo">
        <img [src]="photo" [width]="width" [height]="height" alt="photo" />
      </div>
    </div>
  `,
  styleUrls: ['./fingerprint-detector.component.scss']
})
export class FingerprintDetectorComponent implements OnInit {

  // fingerprint-match
  public currentStream: any;
  public videoDimensions: any;
  private hasTorch = true;
  private track: MediaStreamTrack;

  // video player
  @Input() stream: any;
  @Input() width: number;
  @Input() height: number;
  @Output() takePhoto: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('fingerprintVideoElement') fingerprintVideoElement: ElementRef;
  @ViewChild('canvas', {static: false}) canvas: ElementRef<HTMLCanvasElement>;
  modelsReady: boolean;
  count = 50;
  photo: string;
  hand: any;
  message: string;
  screenshotTaked = false;

  constructor(
    private renderer2: Renderer2,
    private elementRef: ElementRef,
    private router: Router,
    private route: ActivatedRoute,
    // @Inject(DOCUMENT) private document: Document,
  ) {
    this.hand = this.route.snapshot.queryParams.hand || null;
  }

  ngOnInit(): void {
    this.listenerEvents();
    this.checkMediaSources();
    this.getSizeCam();
  }

  listenerEvents = () => {
    this.modelsReady = true;
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
        this.track = stream.getVideoTracks()[0];

        // Create image capture object and get camera capabilities
        const imageCapture = new window.ImageCapture(this.track);
        imageCapture.getPhotoCapabilities().then(() => {

          // todo: check if camera has a torch
          this.track.applyConstraints({
            // @ts-ignore
            advanced: [{ torch: this.hasTorch }]
          });

          // let there be light!
          // const btn = document.querySelector('.switch');
          // btn.addEventListener('click', () => {
          //
          // });
        });
      }).catch(e => console.log('The user has been denied permission'));
    } else {
      console.log('No media exists');
    }
  }

  getSizeCam = (): void => {
    // @ts-ignore
    const elementCam: HTMLElement = document.querySelector('.face-match');
    const { width, height } = elementCam.getBoundingClientRect();
    this.videoDimensions = { width, height };
  }

  drawFace = (results, displaySize) => {
    const canvasCtx = this.canvas.nativeElement.getContext('2d');
    canvasCtx.drawImage(results.image, 0, 0, displaySize.width, displaySize.height);
    this.playListener();
    if (results.multiHandLandmarks && this.hand.includes(results.multiHandedness[0].label.toLowerCase())) {
      this.message = null;
      for (const landmarks of results.multiHandLandmarks) {
        // console.log(landmarks);
        const filteredLandmarks = landmarks.filter((landmark, index) => [8, 12, 16, 20].includes(index));
        // console.log(filteredLandmarks);
        // window.drawConnectors(canvasCtx, landmarks, window.HAND_CONNECTIONS, {color: '#00FF00', lineWidth: 5});
        window.drawLandmarks(canvasCtx, filteredLandmarks, {
          color: '#46DB9E',
          fillColor: '#00FF0000',
          radius: (x) => {
            return window.lerp(x.from.z, -0.1, .40, 45, 1);
          }
        });
      }
    } else {
      this.message = `Ubica la mano`;
    }
    canvasCtx.restore();
  }

  loadedMetaData(): void {
    this.fingerprintVideoElement.nativeElement.play();
    this.setML();
  }

  playListener(): void {
    this.renderer2.setProperty(this.canvas.nativeElement, 'width', this.width);
    this.renderer2.setProperty(this.canvas.nativeElement, 'height', this.height);
    this.renderer2.setStyle(this.canvas.nativeElement, 'width', `${this.width}px`);
    this.renderer2.setStyle(this.canvas.nativeElement, 'height', `${this.height}px`);
  }

  async snapshot(results): Promise<void> {
    // this.playListener();
    const canvasCtx = this.canvas.nativeElement.getContext('2d');
    const elementCam: HTMLElement = document.querySelector('.face-match');
    const { width, height } = elementCam.getBoundingClientRect();

    // get the scale
    const scale = Math.min(canvasCtx.canvas.width / width, canvasCtx.canvas.height / height);
    // get the top left position of the image
    const x = (canvasCtx.canvas.width / 2) - (width / 2) * scale;
    const y = (canvasCtx.canvas.height / 2) - (height / 2) * scale;
    canvasCtx.drawImage(this.fingerprintVideoElement.nativeElement, x, y, (width * scale) * 1.3, height * scale);
    this.screenshotTaked = true;

    setTimeout(() => this.screenshotTaked = false, 1000);

    this.takePhoto.emit({
      image: canvasCtx.canvas.toDataURL('image/jpg'),
      results,
    });
  }

  onResults(results): void {
    this.drawFace(results, { width: this.width, height: this.height });
    if (results && this.count > 0) {
      if (results.multiHandLandmarks && this.hand.includes(results.multiHandedness[0].label.toLowerCase())) {
        console.log('Having results form', results);
        this.counterDown(results);
      } else {
        console.log('No hands recognized');
        this.resetCounter();
      }
    }
  }

  async setML(): Promise<void> {

    const hands = new window.Hands({locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }});

    hands.setOptions({
      maxNumHands: 1,
      minDetectionConfidence: 0.8,
      minTrackingConfidence: 0.8,
    });

    hands.onResults((results) => this.onResults(results));

    await hands.send({
      image: this.fingerprintVideoElement.nativeElement
    });

    try {
      setInterval(async () => await hands.send({image: this.fingerprintVideoElement.nativeElement}), 10);
    } catch (e) {
      this.snapshot(null);
    }
  }

  private counterDown(results): void {
    this.count--;

    if (this.count === 0) {
      this.snapshot(results);
    } else if (this.count < 0) {
      this.resetCounter();
    }
  }

  private resetCounter(): void {
    this.count = 50;
  }

}
