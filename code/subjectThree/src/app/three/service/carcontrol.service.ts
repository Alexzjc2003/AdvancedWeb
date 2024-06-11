import { Injectable } from '@angular/core';
import * as CANNON from 'cannon-es';

@Injectable({
  providedIn: 'root',
})
export class CarcontrolService {
  car: CANNON.Body = new CANNON.Body();
  status: CarStatus = new CarStatus();

  rotationMin: number = -20;
  rotationMax: number = 20;
  rotationRatio: number[] = [30, 40, 50];

  turningLight: number = 0;

  audio = new window.AudioContext();
  beeping = false;
  os: OscillatorNode = this.audio.createOscillator();

  constructor() {
    this.os.start(0);
  }

  public setControl(
    dt: number,
    gear: number = 0,
    throttle: boolean = false,
    brake: boolean = false,
    turn: number = 0
  ): void {
    this.status.rotation +=
      dt *
      turn *
      this.rotationRatio[Math.floor(Math.abs(this.status.rotation) / 8)];
    this.status.rotation =
      this.status.rotation < this.rotationMin
        ? this.rotationMin
        : this.status.rotation > this.rotationMax
        ? this.rotationMax
        : this.status.rotation;

    this.status.gear = gear;
    this.status.throttle = throttle;
    this.status.brake = brake;
  }

  public turnLight(light: number) {
    this.turningLight = this.turningLight === light ? 0 : light;
  }

  public isLightCorrect(): boolean {
    return this.turningLight * this.status.rotation > 0;
  }

  public getStatus() {
    return { ...this.status, speed: this.car.velocity.length() * 3.6 };
  }

  public beep() {
    if (this.beeping) {
      return;
    }
    this.audio.resume().then(() => {
      this.os.connect(this.audio.destination);
      setTimeout(() => {
        this.os.disconnect(this.audio.destination);
        this.beeping = false;
      }, 150);
      this.beeping = true;
    });
  }

  public bindCar(car: CANNON.Body) {
    this.car = car;
  }
}

export class CarStatus {
  rotation: number = 0;
  gear: number = 0;
  throttle: boolean = false;
  brake: boolean = false;
}
