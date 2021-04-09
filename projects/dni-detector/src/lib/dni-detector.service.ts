import {EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DniDetectorService {

  callbackModels: EventEmitter<any> = new EventEmitter<any>();

  constructor() {
    this.loadModels();
  }

  public loadModels(): void {
    Promise.resolve().then(() => {
      this.callbackModels.emit(true);
    });
  }
}
