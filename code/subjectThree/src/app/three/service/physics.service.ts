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
    restitution: 0.00001,
  });
  groundBody: CANNON.Body = new CANNON.Body({
    mass: 10000000,
    type: CANNON.Body.STATIC,
    material: this.groundMaterial,
  });
  houseBody: CANNON.Body = new CANNON.Body({
    mass: 100000,
    type: CANNON.Body.STATIC,
    material: this.groundMaterial,
  });
  debugger: any;
  updateDebugger!: Function;

  init = {
    pos: new CANNON.Vec3(),
    rot: new CANNON.Quaternion(),
  };

  useDebugger(scene: THREE.Scene) {
    this.debugger = CannonDebugger(scene, this.world);
    this.updateDebugger = this.debugger.update;
  }

  constructor() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.8, 0);

    this.world.addBody(this.groundBody);
    this.world.addBody(this.houseBody);
    this.vehicle?.addToWorld(this.world);
  }

  setCollideHandler(callback: () => void) {
    this.houseBody.addEventListener('collide', () => {
      console.log('collide');
      callback();
    });
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
        0.5,
        dir_ptr.length() / 2 + 0.01
      )
    );

    this.groundBody.addShape(
      _box,
      _base_pos
        .addScaledVector(0.5, _base_ptr)
        .addScaledVector(0.5, _dir_ptr)
        .addScaledVector(-0.5, new CANNON.Vec3(0, 0.8, 0)),
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

  public addHouse(
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

    let _height = new CANNON.Vec3(0, 100, 0);

    let _box = new CANNON.Box(
      new CANNON.Vec3(
        base_ptr.length() / 2 + 0.01,
        _height.length() / 2,
        dir_ptr.length() / 2 + 0.01
      )
    );

    this.houseBody.addShape(
      _box,
      _base_pos
        .addScaledVector(0.5, _base_ptr)
        .addScaledVector(0.5, _dir_ptr)
        .addScaledVector(0.5, _height),
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
  wheels: CANNON.Body[] = [];

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
      radius: 0.25 * _size.y,
      directionLocal: new CANNON.Vec3(0, -1, 0),
      suspensionStiffness: 30,
      suspensionRestLength: 0.3,
      maxSuspensionTravel: 0.1,
      maxSuspensionForce: 100000,
      dampingRelaxation: 2.2,
      dampingCompression: 4,
      axleLocal: new CANNON.Vec3(0, 0, 1),
      chassisConnectionPointLocal: new CANNON.Vec3(1, 0, 1),
      useCustomSlidingRotationalSpeed: true,

      // Todo: following parameters need further tests
      frictionSlip: 100000,
      rollInfluence: 0.05,
      customSlidingRotationalSpeed: -10000,
    };

    let wheel_x = _size.x * 0.35;
    let wheel_y = _size.y * 0.35;
    let wheel_z = _size.z * 0.3;
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

    // create rigid body for wheels
    this.vehicle.wheelInfos.forEach((w) => {
      // let _wheelShape = new CANNON.Cylinder(w.radius, w.radius, 0.2);
      let _wheelShape = new CANNON.Sphere(w.radius);
      let _wheelbody = new CANNON.Body({
        mass: 10,
        type: CANNON.BODY_TYPES.KINEMATIC,
        collisionFilterGroup: 0,
      });
      _wheelbody.addShape(
        _wheelShape,
        new CANNON.Vec3(),
        new CANNON.Quaternion().setFromAxisAngle(
          new CANNON.Vec3(0, 0, 1),
          Math.PI / 2
        )
      );
      this.world.addBody(_wheelbody);
      this.wheels.push(_wheelbody);
    });

    this.init.pos = new CANNON.Vec3(
      car.position.x,
      car.position.y,
      car.position.z
    );

    this.init.rot = new CANNON.Quaternion(
      car.quaternion.x,
      car.quaternion.y,
      car.quaternion.z,
      car.quaternion.w
    );

    this.initCar();
  }

  public initCar() {
    this.car.position.copy(this.init.pos);
    this.car.quaternion.copy(this.init.rot);
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

    this.vehicle.wheelInfos.forEach((w, i) => {
      this.wheels[i].position.copy(w.worldTransform.position);
      this.wheels[i].quaternion.copy(w.worldTransform.quaternion);
      // let _t = this.vehicle.getWheelTransformWorld(i);
      // this.wheels[i].position.copy(_t.position);
      // this.wheels[i].quaternion.copy(_t.quaternion);
    });
  }

  public controlCar(status: CarStatus) {
    let _P = 100000;
    let _v = this.car.velocity.length();

    _v = _v < 20 ? 20 : _v;
    let _f = _P / _v;

    // let _f = 2000;

    for (let i = 2; i < 4; i++) {
      // TODO: there is an error
      this.vehicle.setBrake(status.brake ? (_f > 2000 ? _f : 5000) : 0, i);
    }

    this.vehicle.applyEngineForce(
      status.throttle ? -_f * status.gear * 0.5 : 0,
      2
    );
    this.vehicle.applyEngineForce(
      status.throttle ? -_f * status.gear * 0.5 : 0,
      3
    );

    this.vehicle.setSteeringValue((status.rotation / 180) * Math.PI, 0);
    this.vehicle.setSteeringValue((status.rotation / 180) * Math.PI, 1);
    this.vehicle.setSteeringValue(0, 2);
    this.vehicle.setSteeringValue(0, 3);
  }
}
