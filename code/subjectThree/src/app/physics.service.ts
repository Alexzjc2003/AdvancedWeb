import { Injectable } from '@angular/core';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { CarStatus } from './carcontrol.service';
import CannonDebugger from 'cannon-es-debugger';

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
    material: this.groundMaterial,
  });
  debugger: any;
  updateDebugger!: Function;

  useDebugger(scene: THREE.Scene) {
    this.debugger = CannonDebugger(scene, this.world);
    this.updateDebugger = this.debugger.update;
  }

  constructor() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.8, 0);

    this.world.addBody(this.groundBody);
    this.vehicle?.addToWorld(this.world);
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
      new CANNON.Vec3(
        base_ptr.length() / 2 + 0.01,
        0.01,
        dir_ptr.length() / 2 + 0.01
      )
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

  car: CANNON.Body = new CANNON.Body({
    mass: 1200,
    material: new CANNON.Material({
      friction: 0,
      restitution: 0.01,
    }),
  });

  vehicle: CANNON.RaycastVehicle = new CANNON.RaycastVehicle({
    chassisBody: this.car,
    indexRightAxis: 0,
    indexForwardAxis: 1,
    indexUpAxis: 2,
  });

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

    // let _options:CANNON.WheelInfoOptions = {
    let _options = {
      radius: 0.06 * _size.y,
      directionLocal: new CANNON.Vec3(0, -1, 0),
      suspensionStiffness: 30,
      suspensionRestLength: 0.3,
      maxSuspensionTravel: 0.3,
      maxSuspensionForce: 100000,
      dampingRelaxation: 2.3,
      dampingCompression: 4.4,
      axleLocal: new CANNON.Vec3(0, 0, 1),
      chassisConnectionPointLocal: new CANNON.Vec3(1, 0, 1),
      frictionSlip: 10000,
      rollInfluence: 0.01,
      useCustomSlidingRotationalSpeed: true,
      customSlidingRotationalSpeed: -30,
    };

    let wheel_x = _size.x * 0.5;
    let wheel_y = _size.y * 0.2;
    let wheel_z = _size.z * 0.45;
    //设置第一个轮的位置，并将轮子信息添加到车辆类中
    _options.chassisConnectionPointLocal.set(-wheel_x, wheel_y, wheel_z);
    this.vehicle.addWheel(_options);
    //设置第二个轮的位置，并将轮子信息添加到车辆类中
    _options.chassisConnectionPointLocal.set(wheel_x, wheel_y, wheel_z);
    this.vehicle.addWheel(_options);
    //设置第三个轮的位置，并将轮子信息添加到车辆类中
    _options.chassisConnectionPointLocal.set(-wheel_x, wheel_y, -wheel_z);
    this.vehicle.addWheel(_options);
    //设置第四个轮的位置，并将轮子信息添加到车辆类中
    _options.chassisConnectionPointLocal.set(wheel_x, wheel_y, -wheel_z);
    this.vehicle.addWheel(_options);

    // this.vehicle.wheelInfos.forEach((w) => {
    //   let _cylinder = new CANNON.Cylinder(w.radius, w.radius, 0.2);
    //   let _wheelbody = new CANNON.Body({
    //     mass: 1,
    //     type: CANNON.BODY_TYPES.KINEMATIC,
    //     collisionFilterGroup: 0,
    //   });
    //   _wheelbody.addShape(
    //     _cylinder,
    //     new CANNON.Vec3(),
    //     new CANNON.Quaternion().setFromAxisAngle(
    //       new CANNON.Vec3(1, 0, 0),
    //       Math.PI / 2
    //     )
    //   );
    //   this.world.addBody(_wheelbody);
    // });

    this.car.position = new CANNON.Vec3(
      car.position.x,
      car.position.y,
      car.position.z
    );
    this.car.quaternion = new CANNON.Quaternion(
      car.quaternion.x,
      car.quaternion.y,
      car.quaternion.z,
      car.quaternion.w
    );
  }

  public getCarPosition(): THREE.Vector3 {
    return new THREE.Vector3(
      this.car.position.x,
      this.car.position.y,
      this.car.position.z
    );
  }

  public getCarRotation(): THREE.Quaternion {
    return new THREE.Quaternion(
      this.car.quaternion.x,
      this.car.quaternion.y,
      this.car.quaternion.z,
      this.car.quaternion.w
    );
  }

  /**
   * Step the simulation
   * @param {number} dt delta time (in seconds) since last step call
   */
  public step(dt: number): void {
    this.world.step(1 / 60, dt, 100);
  }

  public controlCar(status: CarStatus) {
    let _P = 80000;
    let _v = this.car.velocity.length();

    // _v = _v < 25 ? 25 : _v;
    // let _f = _P / _v;

    let _f = 2000;

    for (let i = 0; i < 4; i++) {
      this.vehicle.setBrake(status.brake ? 5000 : 0, i);
    }

    this.vehicle.applyEngineForce(
      status.throttle ? _f * status.gear * 0.5 : 0,
      2
    );
    this.vehicle.applyEngineForce(
      status.throttle ? _f * status.gear * 0.5 : 0,
      3
    );

    this.vehicle.setSteeringValue((status.rotation / 180) * Math.PI, 0);
    this.vehicle.setSteeringValue((status.rotation / 180) * Math.PI, 1);

    // this.vehicle.applyEngineForce(status.throttle ? -500 * status.gear : 0, 0);
    // this.vehicle.applyEngineForce(status.throttle ? -500 * status.gear : 0, 1);
  }
}
