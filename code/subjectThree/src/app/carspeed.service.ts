import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root',
})
export class CarspeedService {
  config = {
    ratioFraction: 1,
    ratioBrake: 1,
    ratioAccelerate: 10,
    ratioSpeed: 1,
    maxSpeedForward: 60,
    maxSpeedBackword: -10,

    ratioTurn: 1,
    minTurnDegree: 0,
    maxTurnDegree: 180,

    modelLength: 100,
  };

  status = {
    currentSpeed: 0,
    isAccelerating: 0,

    currentTurning: 90,
    isTurning: 0,
  };

  constructor(cfg: Object) {
    if (cfg) for (let c in cfg) this.config[c] = cfg[c];
  }

  /**
   * Get the next position after dt time
   * @param {number} dt Expect dt in seconds
   * @param {THREE.Vector3} currentPosition
   * @param {THREE.Euler} currentDirection
   * @returns {THREE.Vector3} next position
   */
  public getNextPosition(
    dt: number,
    currentPosition: THREE.Vector3,
    currentDirection: THREE.Euler
  ): THREE.Vector3 {
    if (this.status.isAccelerating === 0) {
      if (this.status.currentSpeed === 0) {
        return currentPosition;
      }
    }
    console.log(this.status.isAccelerating);
    this.calcSpeed(dt);

    let _rad = (this.status.currentTurning / 180) * Math.PI;
    // console.log(Math.sin(_rad))

    return currentPosition
      .addScaledVector(
        new THREE.Vector3(0, 0, 1).applyEuler(currentDirection),
        Math.sin(_rad) * dt * this.status.currentSpeed
      )
      .addScaledVector(
        new THREE.Vector3(1, 0, 0).applyEuler(currentDirection),
        Math.cos(_rad) * dt * this.status.currentSpeed
      );
  }

  private calcSpeed(dt: number): void {
    // fraction
    this.status.currentSpeed -=
      Math.sign(this.status.currentSpeed) * dt * this.config.ratioFraction;

    // brake
    // if dir of spd and acc differ, see as a brake
    if (this.status.currentSpeed * this.status.isAccelerating < 0) {
      let _tmp = dt * this.config.ratioBrake;
      if (Math.abs(this.status.currentSpeed) < _tmp)
        this.status.currentSpeed = 0;
      else
        this.status.currentSpeed -=
          _tmp * Math.sign(this.status.currentSpeed) * _tmp;
    }

    // brake blur
    if (
      this.status.isAccelerating === 0 &&
      Math.abs(this.status.currentSpeed) < 1
    ) {
      this.status.currentSpeed = 0;
    }

    // accelerating
    if (
      this.status.currentSpeed * this.status.isAccelerating > 0 ||
      (this.status.currentSpeed === 0 && this.status.isAccelerating !== 0)
    ) {
      this.status.currentSpeed +=
        this.status.isAccelerating * dt * this.config.ratioAccelerate;
      this.status.currentSpeed =
        this.status.currentSpeed <
        this.config.ratioSpeed * this.config.maxSpeedBackword
          ? this.config.ratioSpeed * this.config.maxSpeedBackword
          : this.status.currentSpeed >
            this.config.ratioSpeed * this.config.maxSpeedForward
          ? this.config.ratioSpeed * this.config.maxSpeedForward
          : this.status.currentSpeed;
    }

    this.status.isAccelerating = 0;
  }

  /**
   * Get the next rotation after dt time
   * @param {number} dt Expect dt in seconds
   * @param {THREE.Euler} currentDirection
   * @returns {THREE.Euler} next direction
   */
  public getNextDirection(
    dt: number,
    currentDirection: THREE.Euler
  ): THREE.Euler {
    this.status.currentTurning +=
      dt * this.config.ratioTurn * this.status.isTurning;
    // this.status.currentSpeed;
    this.status.currentTurning =
      this.status.currentTurning < this.config.minTurnDegree
        ? this.config.minTurnDegree
        : this.status.currentTurning > this.config.maxTurnDegree
        ? this.config.maxTurnDegree
        : this.status.currentTurning;

    this.status.isTurning = 0;

    let _ds =
      Math.cos((this.status.currentTurning / 180) * Math.PI) *
      dt *
      this.status.currentSpeed;

    return new THREE.Euler(
      currentDirection.x,
      currentDirection.y + _ds / this.config.modelLength,
      currentDirection.z
    );
  }

  public getNextPosDir(
    dt: number,
    currentPosition: THREE.Vector3,
    currentDirection: THREE.Euler
  ): [THREE.Vector3, THREE.Euler] {
    return [
      this.getNextPosition(dt, currentPosition, currentDirection),
      this.getNextDirection(dt, currentDirection),
    ];
  }

  public getStatus(): Object {
    return { ...this.status };
  }
}
