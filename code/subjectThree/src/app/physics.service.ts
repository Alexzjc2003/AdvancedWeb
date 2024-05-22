import { Injectable } from '@angular/core';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { CarStatus } from './carcontrol.service';

@Injectable({
  providedIn: 'root',
})
export class PhysicsService {
  world: CANNON.World;
  groundMaterial: CANNON.Material = new CANNON.Material({
    friction: 0.01,
    restitution: 0.001,
  });
  groundBody: CANNON.Body = new CANNON.Body({
    type: CANNON.Body.STATIC,
    // mass: 0,
    material: this.groundMaterial,
  });

  car: CANNON.Body = new CANNON.Body({
    type: CANNON.BODY_TYPES.DYNAMIC,
    mass: 1200,
    material: new CANNON.Material({
      friction: 0.05,
      restitution: 0.001,
    }),
  });

  constructor() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.8, 0);

    this.world.addBody(this.groundBody);
    this.world.addBody(this.car);
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
      new CANNON.Vec3(base_ptr.length() / 2, 0.01, dir_ptr.length() / 2)
    );

    this.groundBody.addShape(
      _box,
      _base_pos.addScaledVector(0.5, _base_ptr).addScaledVector(0.5, _dir_ptr),
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

  public setCar(car: THREE.Object3D): void {
    let _3_box = new THREE.Box3().setFromObject(car, true);
    let _size = new THREE.Vector3();
    let _center = new THREE.Vector3();

    _3_box.getSize(_size);
    _3_box.getCenter(_center);

    let _c_box = new CANNON.Box(
      new CANNON.Vec3(_size.x * 0.5, _size.y * 0.45, _size.z * 0.5)
    );
    this.car.shapes.forEach((s) => this.car.removeShape(s));
    this.car.addShape(
      _c_box,
      new CANNON.Vec3(
        _center.x - car.position.x,
        _center.y - car.position.y + _size.y * 0.05,
        _center.z - car.position.z
      )
    );

    let _c_wheel = new CANNON.Box(
      new CANNON.Vec3(_size.x * 0.1, _size.y * 0.05, _size.z * 0.1)
    );

    this.car.addShape(
      _c_wheel,
      new CANNON.Vec3(
        _center.x - car.position.x + _size.x * 0.45,
        _center.y - car.position.y - _size.y * 0.45,
        _center.z - car.position.z + _size.z * 0.35
      )
    );
    this.car.addShape(
      _c_wheel,
      new CANNON.Vec3(
        _center.x - car.position.x - _size.x * 0.45,
        _center.y - car.position.y - _size.y * 0.45,
        _center.z - car.position.z + _size.z * 0.35
      )
    );
    this.car.addShape(
      _c_wheel,
      new CANNON.Vec3(
        _center.x - car.position.x + _size.x * 0.45,
        _center.y - car.position.y - _size.y * 0.45,
        _center.z - car.position.z - _size.z * 0.35
      )
    );
    this.car.addShape(
      _c_wheel,
      new CANNON.Vec3(
        _center.x - car.position.x - _size.x * 0.45,
        _center.y - car.position.y - _size.y * 0.45,
        _center.z - car.position.z + _size.z * 0.35
      )
    );

    this.car.position = new CANNON.Vec3(
      car.position.x,
      car.position.y,
      car.position.z
    );
  }

  public getCarPosition(): THREE.Vector3 {
    let _pos = this.car.position;
    return new THREE.Vector3(_pos.x, _pos.y, _pos.z);
  }

  public getCarRotation(): THREE.Quaternion {
    let _quat = this.car.quaternion;
    return new THREE.Quaternion(_quat.x, _quat.y, _quat.z, _quat.w);
  }

  /**
   * Step the simulation
   * @param {number} dt delta time (in seconds) since last step call
   */
  public step(dt: number): void {
    // console.log(this.car.velocity.length()*3.6)
    this.world.step(1 / 60, dt, 100);
  }

  public controlCar(status: CarStatus) {
    let _force = new CANNON.Vec3();
    let _up_axis = new CANNON.Mat3()
      .setRotationFromQuaternion(this.car.quaternion)
      .vmult(new CANNON.Vec3(0, 1, 0));
    let _v = this.car.velocity.clone();
    _v = new CANNON.Vec3(1, 0, 1).vmul(_v);

    let _v_scale = this.car.velocity.length();

    _v_scale = _v_scale > 10 ? _v_scale : 10;
    let _f = 120000 / _v_scale;

    if (status.gear === 1) {
      _force.set(0, 0, _f);
    } else if (status.gear === 0) {
      _force.set(0, 0, 0);
    } else if (status.gear === -1) {
      _force.set(0, 0, -0.3 * _f);
    }

    _force = new CANNON.Mat3()
      .setRotationFromQuaternion(this.car.quaternion)
      .vmult(_force);

    if (status.brake) {
      this.car.velocity = new CANNON.Vec3(0, 0, 0);
    }

    if (status.throttle) {
      this.car.applyForce(
        _force.scale(0.1),
        this.car.shapeOffsets[3]
      );
      this.car.applyForce(
        _force.scale(0.1),
        this.car.shapeOffsets[4]
      );

      this.car.applyForce(
        new CANNON.Mat3()
          .setRotationFromQuaternion(
            new CANNON.Quaternion().setFromAxisAngle(
              _up_axis,
              (status.rotation / 180) * Math.PI
            )
          )
          .vmult(_force.scale(0.4)),
        this.car.shapeOffsets[1]
      );
      this.car.applyForce(
        new CANNON.Mat3()
          .setRotationFromQuaternion(
            new CANNON.Quaternion().setFromAxisAngle(
              _up_axis,
              (status.rotation / 180) * Math.PI
            )
          )
          .vmult(_force.scale(0.4)),
        this.car.shapeOffsets[2]
      );

      // console.log(this.car.torque)
    }
  }
}
