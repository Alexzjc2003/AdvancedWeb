import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root',
})
export class CameraService {
  camera!: THREE.PerspectiveCamera;

  followObject: THREE.Vector3 | undefined;
  followOffset: THREE.Euler = new THREE.Euler(Math.PI / 6, 0, 0, 'YXZ');
  followDistance: number = 10;

  ratio: number = 0.8;

  constructor() {}

  initCam(fov: number, aspect: number, near: number, far: number) {
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  }

  setPosition(pos: THREE.Vector3) {
    this.camera.position.copy(pos);
  }

  setLookAt(pos: THREE.Vector3) {
    this.camera.lookAt(pos);
  }

  control(dt: number, up: number, right: number, far: number) {
    this.followOffset.x += dt * up * this.ratio;
    this.followOffset.y -= dt * right * this.ratio;
    this.followOffset.y =
      this.followOffset.y > 80
        ? 80
        : this.followOffset.y < -80
        ? -80
        : this.followOffset.y;
    this.followDistance += dt * far;
  }

  follow(obj: THREE.Object3D) {
    this.camera.position.copy(
      obj.position
        .clone()
        .addScaledVector(
          new THREE.Vector3(0, 0, -1)
            .applyEuler(this.followOffset)
            .applyQuaternion(obj.quaternion),
          this.followDistance
        )
    );
    this.camera.lookAt(obj.position);
  }
}
