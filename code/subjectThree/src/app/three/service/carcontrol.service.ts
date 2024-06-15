import { Injectable } from '@angular/core';
import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

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

  geoLeft;
  geoRight;
  geoNone;
  turningSign!: THREE.Mesh;

  constructor() {
    this.os.start(0);

    let self = this;
    const fontLoader = new FontLoader();
    fontLoader.load('assets/fonts/helvetiker_bold.typeface.json', (font) => {
      let para = {
        font: font,
        size: 80,
        depth: 0.001,
      };
      self.geoLeft = new TextGeometry('<-', para);
      self.geoRight = new TextGeometry('->', para);
      self.geoNone = new TextGeometry('^^', para);

      self.turningSign = new THREE.Mesh(
        this.geoNone,
        new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff0000) })
      );
      this.turningSign.position.set(30, 150, 0);
      this.turningSign.scale.set(0.5, 0.5, 0.5);
      this.turningSign.rotateY(Math.PI);
    });
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

    let _p = this.turningSign.parent;
    _p?.remove(this.turningSign);
    this.turningSign = new THREE.Mesh(
      this.turningLight > 0
        ? this.geoLeft
        : this.turningLight < 0
        ? this.geoRight
        : this.geoNone,
      new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff0000) })
    );

    this.turningSign.position.set(30, 150, 0);
    this.turningSign.scale.set(0.5, 0.5, 0.5);
    this.turningSign.rotateY(Math.PI);

    _p?.add(this.turningSign);
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

  public updateLight() {}
}

export class CarStatus {
  rotation: number = 0;
  gear: number = 0;
  throttle: boolean = false;
  brake: boolean = false;
}
