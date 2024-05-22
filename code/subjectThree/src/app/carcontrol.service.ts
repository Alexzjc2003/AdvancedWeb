import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CarcontrolService {
  status: CarStatus = new CarStatus();

  rotationMin: number = -20;
  rotationMax: number = 20;
  rotationRatio: number[] = [10, 20, 50];

  constructor() {}

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

  public getStatus(): CarStatus {
    return this.status;
  }
}

export class CarStatus {
  rotation: number = 0;
  gear: number = 0;
  throttle: boolean = false;
  brake: boolean = false;
}
