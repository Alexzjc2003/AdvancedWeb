import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

import { roadPosition } from '../roadPosition';
import { roadOffset } from '../roadOffset';
import { PhysicsService } from '../physics.service';
import { CarcontrolService } from '../carcontrol.service';

@Component({
  selector: 'app-threejs-scene',
  standalone: true,
  imports: [],
  providers: [PhysicsService],
  templateUrl: './threejs-scene.component.html',
  styleUrl: './threejs-scene.component.css',
})
export class ThreejsSceneComponent implements OnInit {
  scene: THREE.Scene = new THREE.Scene();
  camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera();
  renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
  clock: THREE.Clock = new THREE.Clock();

  cameraPosition: THREE.Vector3 = new THREE.Vector3();
  lookAtVector: THREE.Vector3 = new THREE.Vector3();
  ambientLight: THREE.AmbientLight = new THREE.AmbientLight();
  directionalLight: THREE.DirectionalLight = new THREE.DirectionalLight();

  model:
    | {
        obj: THREE.Object3D;
        // box: THREE.Box3;
      }
    | undefined;

  roadList: {
    obj: THREE.Object3D;
    box: THREE.Box3;
  }[];

  roadPosition: {
    name: string;
    x: number;
    y: number;
    z: number;
    rotate: number;
  }[];
  roadOffset: {
    [key: string]: { offset_x: number; offset_y: number; offset_z: number };
  };

  keyboardPressed: { [key: string]: number };

  physics: PhysicsService = new PhysicsService();
  carcontrol: CarcontrolService = new CarcontrolService();

  constructor() {
    this.roadPosition = roadPosition;
    this.roadOffset = roadOffset;

    this.roadList = [];
    this.keyboardPressed = {
      w: 0,
      a: 0,
      s: 0,
      d: 0,
    };
  }

  ngOnInit(): void {
    this.roadPosition = roadPosition;
    this.roadOffset = roadOffset;
    this.initScene();
    this.renderScene();
  }

  initScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xadd8e6);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      5000
    );
    this.camera.position.y = 2;

    // 平视
    // this.cameraPosition = new THREE.Vector3(0, 200, 500);
    // this.cameraPosition = new THREE.Vector3(500, 0, 0);
    // 俯视
    this.cameraPosition = new THREE.Vector3(0, 1200, 0);

    this.lookAtVector = new THREE.Vector3(0, 0, 0);

    // 添加环境光
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(this.ambientLight);

    // 添加方向光
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    this.directionalLight.position.set(10, 10, 10);
    this.scene.add(this.directionalLight);

    let axes = new THREE.AxesHelper(2000);
    this.scene.add(axes);

    this.loadLocalCar();
    this.loadRoadEnvironment();
    // this.loadAllRoads();

    this.bindEventListener();
  }

  loadAllRoads() {
    let roadNameList = [
      // 'road_bend',
      'road_crossing',
      'road_crossroadPath',
      // 'road_curve',
      // 'road_curveIntersection',
      'road_end',
      // 'road_endRound',
      'road_intersectionPath',
      // 'road_roundabout',
      'road_side',
      // 'road_sideEntry',
      // 'road_sideExit',
      'road_slant',
      // 'road_slantCurve',
      'road_slantFlat',
      // 'road_slantFlatCurve',
      'road_slantFlatHigh',
      'road_slantHigh',
      // 'road_split',
      'road_straight',
    ];

    for (let i = 0; i < roadNameList.length; i++) {
      let roadName = roadNameList[i];
      let mtlPath = `./assets/model/road/road_slantHigh.mtl`;
      let objPath = `./assets/model/road/road_slantHigh.obj`;
      let posX = i * 900;
      this.loadRoadResource(
        mtlPath,
        objPath,
        posX + 150,
        -150,
        0,
        300,
        300,
        300,
        300
      );
    }
  }

  loadLocalCar() {
    let loader = new FBXLoader();
    this.model = undefined;

    let component = this;
    loader.load('./assets/model/cars/police.fbx', function (object) {
      object.position.set(200, 50, 200);
      object.scale.set(0.6, 0.6, 0.6);

      let textureLoader = new THREE.TextureLoader();
      textureLoader.load(
        './assets/model/cars/texture/colormap.png',
        function (texture) {
          let material = new THREE.MeshBasicMaterial({ map: texture });

          object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
              child.material = material;
            }
          });
          component.scene.add(object);
        }
      );

      object.rotateY(Math.PI);

      component.model = {
        obj: object,
        // box: new THREE.Box3().setFromObject(object),
      };

      component.physics.setCar(object);
    });
  }

  loadRoadEnvironment() {
    for (let i = 0; i < this.roadPosition.length; i++) {
      let road = this.roadPosition[i];
      this.loadRoad(
        road['name'],
        road['x'],
        road['y'],
        road['z'],
        road['rotate']
      );
    }
  }

  bindEventListener() {
    let component = this;
    document.addEventListener('keydown', function (event) {
      component.keyboardPressed[event.key] = 1;
    });

    document.addEventListener('keyup', function (event) {
      component.keyboardPressed[event.key] = 0;
    });
  }

  renderScene(): void {
    const animate = () => {
      requestAnimationFrame(animate);
      if (this.model == undefined) {
        return;
      }

      // let _status = this.carcontrol.getStatus();
      let _gear = 0,
        _throttle = false,
        _turn = 0,
        _brake = false;
      if (this.keyboardPressed['w'] == 1) {
        // W键
        _gear += 1;
        _throttle = true;
      }
      if (this.keyboardPressed['s'] == 1) {
        // S键
        _gear -= 1;
        _throttle = true;
      }
      if (this.keyboardPressed['a'] == 1) {
        // A键
        _turn += 1;
      }
      if (this.keyboardPressed['d'] == 1) {
        // D键
        _turn -= 1;
      }
      if (this.keyboardPressed['b']) {
        _brake = true;
      }

      let dt = this.clock.getDelta();
      this.carcontrol.setControl(dt, _gear, _throttle, _brake, _turn);
      this.physics.controlCar(this.carcontrol.getStatus());
      this.physics.step(dt);

      this.model.obj.position.copy(this.physics.getCarPosition());
      this.model.obj.quaternion.copy(this.physics.getCarRotation());

      this.camera.position.copy(
        this.cameraPosition.clone().add(this.model['obj'].position)
      );
      this.camera.lookAt(this.lookAtVector.copy(this.model['obj'].position));

      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }

  loadRoadResource(
    mtlPath: string,
    objPath: string,
    positionX: number,
    positionY: number,
    positionZ: number,
    rotateY: number,
    scaleX: number,
    scaleY: number,
    scaleZ: number
  ) {
    let component = this;

    let mtlLoader = new MTLLoader();
    mtlLoader.load(mtlPath, function (materials) {
      materials.preload();
      let objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.load(objPath, function (object) {
        object.scale.set(scaleX, scaleY, scaleZ);
        object.position.set(positionX, positionY, positionZ);
        object.rotateY(Math.PI * rotateY);
        component.scene.add(object);

        let road = {
          obj: object,
          box: new THREE.Box3().setFromObject(object),
        };
        component.roadList.push(road);
      });
    });
  }

  loadRoad(
    roadName: string,
    positionX: number,
    positionY: number,
    positionZ: number,
    rotateY: number
  ) {
    console.log(`road: ${roadName}`);
    let offset_scale = 300;
    let scaleX = 300;
    let scaleY = 300;
    let scaleZ = 300;

    let offset_dict = this.roadOffset;
    let offset_x = offset_dict[roadName]['offset_x'] * (scaleX / offset_scale);
    let offset_y = offset_dict[roadName]['offset_y'] * (scaleY / offset_scale);
    let offset_z = offset_dict[roadName]['offset_z'] * (scaleZ / offset_scale);
    let puzzles = offset_dict[roadName]['puzzle'];

    let pos_x = positionX + offset_x;
    let pos_y = positionY + offset_y;
    let pos_z = positionZ + offset_z;

    let mtlPath = `./assets/model/road/${roadName}.mtl`;
    let objPath = `./assets/model/road/${roadName}.obj`;
    this.loadRoadResource(
      mtlPath,
      objPath,
      pos_x,
      pos_y,
      pos_z,
      rotateY,
      scaleX,
      scaleY,
      scaleZ
    );

    for (let puzzle of puzzles) {
      // console.log(puzzle['type'], puzzle['vectorX'], puzzle['vectorZ']);
      this.physics.addRoad(
        new THREE.Vector3(positionX, positionY, positionZ),
        new THREE.Vector3(
          puzzle['vectorZ'][0],
          puzzle['vectorZ'][1],
          puzzle['vectorZ'][2]
        ),
        new THREE.Vector3(
          puzzle['vectorX'][0],
          puzzle['vectorX'][1],
          puzzle['vectorX'][2]
        )
      );
    }
  }
}
