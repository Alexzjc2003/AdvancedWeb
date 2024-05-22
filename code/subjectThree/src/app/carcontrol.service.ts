import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CarcontrolService {
  status: CarStatus = new CarStatus();

  rotationMin: number = -80;
  rotationMax: number = 80;
  rotationRatio: number = 1.0;

  constructor() {}

  public setControl(
    dt: number,
    gear: number = 0,
    throttle: boolean = false,
    brake: boolean = false,
    turn: number = 0
  ): void {
    this.status.rotation += dt * turn * this.rotationRatio;
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
