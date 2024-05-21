import { Injectable } from '@angular/core';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

@Injectable({
  providedIn: 'root',
})
export class PhysicsService {
  world: CANNON.World;
  groundMaterial: CANNON.Material = new CANNON.Material({
    friction: 1,
    restitution: 1,
  });
  groundBody: CANNON.Body = new CANNON.Body({
    mass: 0,
    material: this.groundMaterial,
  });

  car: CANNON.Body = new CANNON.Body({
    mass: 1200,
    material: new CANNON.Material({ friction: 500, restitution: 1 }),
  });

  constructor() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.8, 0);

    this.world.addBody(this.groundBody), this.world.addBody(this.car);
  }

  public addRoad(
    base_pos: THREE.Vector3,
    base_ptr: THREE.Vector3,
    dir_ptr: THREE.Vector3
  ) {
    let _base_pos = new CANNON.Vec3(base_pos.x, base_pos.y, base_pos.z);
    let _base_ptr = new CANNON.Vec3(base_ptr.x, base_ptr.y, base_ptr.z);
    let _dir_ptr = new CANNON.Vec3(dir_ptr.x, dir_ptr.y, dir_ptr.z);

    let _up_ptr = new CANNON.Vec3(0, 1, 0);
    let _otho_ptr = _up_ptr.cross(_base_ptr);
    _otho_ptr.normalize();
    _otho_ptr = _otho_ptr.scale(_dir_ptr.length());

    let _box = new CANNON.Box(
      new CANNON.Vec3(base_ptr.length() / 2, dir_ptr.length() / 2, 0.01)
    );

    this.groundBody.addShape(
      _box,
      _base_pos.addScaledVector(0.5, _base_ptr).addScaledVector(0.5, _otho_ptr),
      new CANNON.Quaternion()
        .setFromVectors(new CANNON.Vec3(0, 1, 0), _up_ptr)
        .mult(
          new CANNON.Quaternion().setFromVectors(
            new CANNON.Vec3(0, 0, 1),
            _base_ptr
          )
        )
    );
  }

  public setCar(car: THREE.Group<THREE.Object3DEventMap>) {
    let _3_box = new THREE.Box3().setFromObject(car);
    let _size = new THREE.Vector3();
    let _center = new THREE.Vector3();
    _3_box.getSize(_size);
    _3_box.getCenter(_center);

    let _c_box = new CANNON.Box(
      new CANNON.Vec3(_size.x / 2, _size.y / 2, _size.z / 2)
    );
    this.car.shapes.forEach((s) => this.car.removeShape(s));
    this.car.addShape(_c_box, new CANNON.Vec3(_center.x, _center.y, _center.z));
  }
}
