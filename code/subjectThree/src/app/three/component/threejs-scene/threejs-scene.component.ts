import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';
import { Router, NavigationEnd } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { roadPosition } from '../../../data/roadPosition';
import { buildingPosition } from '../../../data/buildingPosition';

import { PhysicsService } from '@app/three/service/physics.service'
import { CameraService } from '@app/three/service/camera.service';
import { CarcontrolService } from '@app/three/service/carcontrol.service';
import { WebSocketService } from '@app/utils/service/websocket.service';
import { NotificationService } from '@app/three/service/notification.service';
import { LoadResourceService } from '@app/three/service/load-resource.service';

import { roadOffset } from '../../../data/roadOffset';
import { buildingOffset } from '../../../data/buildingOffset';

import { KnowledgeService } from '@app/three/service/knowledge.service';
import { UserService } from '@app/user/service/user.service';
import { LoadResourcePart } from './load-resource';
import { RemotePart } from './remote';

@Component({
  selector: 'app-threejs-scene',
  providers: [PhysicsService, NotificationService],
  templateUrl: './threejs-scene.component.html',
  styleUrl: './threejs-scene.component.css',
})
export class ThreejsSceneComponent implements OnInit {
  scene: THREE.Scene = new THREE.Scene();
  // camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera();
  cameraService: CameraService = new CameraService();
  renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
  clock: THREE.Clock = new THREE.Clock();

  lookAtVector: THREE.Vector3 = new THREE.Vector3();
  ambientLight: THREE.AmbientLight = new THREE.AmbientLight();
  directionalLight: THREE.DirectionalLight = new THREE.DirectionalLight();

  model: any;
  model_name: string = '';

  roadOffset: {
    [key: string]: {
      offset_x: number;
      offset_y: number;
      offset_z: number;
      puzzle: any[];
    };
  };

  buildingOffset: {
    [key: string]: { offset_x: number; offset_y: number; offset_z: number };
  };

  roadList: {
    obj: THREE.Object3D;
    box: THREE.Box3;
  }[];

  buildingList: {
    obj: THREE.Object3D;
    box: THREE.Box3;
  }[];

  ground: any;

  roadPosition: {
    scale: number[];
    clips: {
      name: string;
      x: number;
      y: number;
      z: number;
      rotate: number;
    }[];
  };

  buildingPosition: {
    scale: number[];
    clips: {
      name: string;
      x: number;
      y: number;
      z: number;
      rotate: number;
    }[];
  };

  keyboardPressed: { [key: string]: number };

  physics: PhysicsService = new PhysicsService();
  carcontrol: CarcontrolService = new CarcontrolService();
  // io: WebSocketService = new WebSocketService();
  loader: LoadResourceService = new LoadResourceService();
  knowledge: KnowledgeService = new KnowledgeService();

  globalScale: THREE.Vector3 = new THREE.Vector3(1, 1, 1);

  roomId: string = "";

  
  container: any;

  chat_msg: string = '';
  isTyping: boolean = false;

  debug_mode: number = 0;
  // debug_mode: number = 1;

  constructor(
    private notification: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private loadResourcePart: LoadResourcePart,
    private remotePart: RemotePart
  ) {
    this.roadPosition = roadPosition;
    this.roadOffset = roadOffset;

    this.buildingPosition = buildingPosition;
    this.buildingOffset = buildingOffset;

    this.roadList = [];
    this.buildingList = [];

    this.keyboardPressed = {
      w: 0,
      a: 0,
      s: 0,
      d: 0,
      e: 0,
      f: 0, // for camera debug
      c: 0, // for camera debug
    };
  }

  ngOnInit(): void {
    this.roadPosition = roadPosition;
    let self = this;

    this.route.queryParamMap.subscribe((params) => {
      self.model_name = params.get('model')!;
      self.roomId = params.get("roomId")!;
      self.initScene();
      self.renderScene();
    });
  }

  initScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xadd8e6);
    this.remotePart.setRoom(this.roomId, this.scene);

    this.physics.useDebugger(this.scene);

    this.container = document.getElementById('three-container');
    if (this.container == undefined) {
      console.log('container not found. use document instead.');
      this.container = document.body;
    }
    this.bindEventListener();

    // this.camera = new THREE.PerspectiveCamera(
    //   75,
    //   this.container.clientWidth / this.container.clientHeight,
    //   0.1,
    //   5000
    // );
    this.cameraService.initCam(
      75,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      100
    );

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );

    this.container.appendChild(this.renderer.domElement);

    // if (this.debug_mode) {
    //   this.camera.position.copy(new THREE.Vector3(0, 10, 0));
    //   this.camera.lookAt(new THREE.Vector3(0, 10, 10));
    // }

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

    this.loadLocalCar(this.model_name);
    this.loadEnvironment();
    // this.loadAllRoads();

    // this.loadAllBuildings();

    this.remotePart.init_websocket();

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.remotePart.sendDisconnect();
      }
    });

    // this.showNotice("发动");
  }

  

  

  sendChatMsg() {
    if (this.chat_msg == "")
      return
    this.remotePart.sendChatMsg(this.chat_msg);
    this.chat_msg = ""
  }


  

  showNotice(theme: string) {
    let noticeContainer = document.getElementById('notice-container');
    if (noticeContainer == undefined) return;

    noticeContainer.innerHTML = '';
    const themeTitle = document.createElement('p');
    themeTitle.textContent = `关于 ${theme} 的提示：`;

    const ul = document.createElement('ul');
    const items = this.knowledge.getKnowledge(theme);

    items.forEach(function (item) {
      const li = document.createElement('li');
      li.textContent = `${item.title}: ${item.content}`;
      ul.appendChild(li);
    });

    noticeContainer.appendChild(themeTitle);
    noticeContainer.appendChild(ul);
  }


  loadLocalCar(carName: string) {
    let self = this;
    this.loadResourcePart.loadCarResouce(carName, (carObj) => {
      carObj.position.set(3, 3, 3);
      self.scene.add(carObj);
      self.model = {
        obj: carObj,
      };
      self.physics.setCar(carObj);
      self.remotePart.sendInit(self.model, self.model_name);
    });
  }

  loadEnvironment() {
    let roadScale = new THREE.Vector3(
      this.roadPosition.scale[0],
      this.roadPosition.scale[1],
      this.roadPosition.scale[2]
    );
    for (let i = 0; i < this.roadPosition.clips.length; i++) {
      let road = this.roadPosition.clips[i];
      this.loadRoad(
        road.name,
        new THREE.Vector3(road.x, road.y, road.z),
        roadScale,
        road.rotate
      );
    }

    let buildingScale = new THREE.Vector3(
      this.buildingPosition.scale[0],
      this.buildingPosition.scale[1],
      this.buildingPosition.scale[2]
    );
    for (let i = 0; i < this.buildingPosition.clips.length; i++) {
      let building = this.buildingPosition.clips[i];
      this.loadBuilding(
        building.name,
        new THREE.Vector3(building.x, building.y, building.z),
        buildingScale,
        building.rotate
      );
    }

    this.loadGround();
  }

  bindEventListener() {
    let self = this;

    document.addEventListener('resize', () => {
      const width = self.container.clientWidth;
      const height = self.container.clientHeight;

      self.renderer.setSize(width, height);
      self.cameraService.camera.aspect = width / height;
      self.cameraService.camera.updateProjectionMatrix();
    });

    document.addEventListener('keydown', function (event) {
      if (self.isTyping) {
        return;
      }
      self.keyboardPressed[event.key] = 1;
    });

    document.addEventListener('keyup', function (event) {
      if (self.isTyping) {
        return;
      }
      self.keyboardPressed[event.key] = 0;
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
        _turn = 0;
      if (this.keyboardPressed['w'] == 1) {
        // W键
        this.showNotice('发动');
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
        this.showNotice('转弯');
        _turn += 1;
      }
      if (this.keyboardPressed['d'] == 1) {
        // D键
        this.showNotice('转弯');
        _turn -= 1;
      }
      if (this.keyboardPressed['e'] == 1) {
        // E键 - 弹窗测试
        this.notification.showNotification('This is a test message.');
      }

      let _right = 0,
        _up = 0,
        _far = 0;
      if (this.keyboardPressed['j']) {
        _right += 1;
      }
      if (this.keyboardPressed['l']) {
        _right -= 1;
      }
      if (this.keyboardPressed['i']) {
        _up += 1;
      }
      if (this.keyboardPressed['k']) {
        _up -= 1;
      }
      if (this.keyboardPressed['o']) {
        _far += 10;
      }
      if (this.keyboardPressed['p']) {
        _far -= 10;
      }

      let dt = this.clock.getDelta();
      this.carcontrol.setControl(dt, _gear, _throttle, false, _turn);
      this.physics.controlCar(this.carcontrol.getStatus());
      this.physics.step(dt);

      this.model.obj.position.copy(this.physics.getCarPosition());
      this.model.obj.quaternion.copy(this.physics.getCarRotation());

      this.cameraService.control(dt, _up, _right, _far);
      this.cameraService.follow(this.model.obj);
      // const direction = new THREE.Vector3();
      // this.model.obj.getWorldDirection(direction);

      // direction.multiplyScalar(6);
      // direction.negate();

      // if (!this.debug_mode) {
      //   this.camera.position.copy(
      //     direction
      //       .clone()
      //       .add(this.model.obj.position)
      //       .add(new THREE.Vector3(0, 4, 0))
      //   );
      //   this.camera.lookAt(this.lookAtVector.copy(this.model.obj.position));
      // } else {
      //   this.debugCameraMove();
      // }

      this.physics.updateDebugger();
      this.remotePart.updateSocket(this.model);
      this.renderer.render(this.scene, this.cameraService.camera);
    };

    animate();
  }

  loadRoad(
    roadName: string,
    centerPosition: THREE.Vector3,
    scale: THREE.Vector3,
    rotateY: number
  ) {
    let self = this;
    let offset_dict = this.roadOffset;
    let offset_x = offset_dict[roadName].offset_x * scale.x;
    let offset_y = offset_dict[roadName].offset_y * scale.y;
    let offset_z = offset_dict[roadName].offset_z * scale.z;

    let offset = new THREE.Vector3(offset_x, offset_y, offset_z);

    let cornerPosition = centerPosition.clone();
    cornerPosition.add(offset);

    // console.log(cornerPosition);

    let mtlPath = `./assets/model/road/${roadName}.mtl`;
    let objPath = `./assets/model/road/${roadName}.obj`;

    this.loadResourcePart.loadRoadResource(mtlPath, objPath, cornerPosition, rotateY, scale,
      (roadObj) => {
        // self.scene.add(roadObj);

        let road = {
          obj: roadObj,
          box: new THREE.Box3().setFromObject(roadObj),
        };
        self.roadList.push(road);
      });

    let puzzles = offset_dict[roadName].puzzle;

    for (let puzzle of puzzles) {
      // console.log(puzzle['type'], puzzle['vectorX'], puzzle['vectorZ']);
      this.physics.addRoad(
        centerPosition,
        new THREE.Vector3(
          puzzle.vectorZ[0] * scale.x,
          puzzle.vectorZ[1] * scale.y,
          puzzle.vectorZ[2] * scale.z
        ),
        new THREE.Vector3(
          puzzle.vectorX[0] * scale.x,
          puzzle.vectorX[1] * scale.y,
          puzzle.vectorX[2] * scale.z
        )
      );
    }
  }



  loadBuilding(
    buildingName: string,
    centerPosition: THREE.Vector3,
    scale: THREE.Vector3,
    rotateY: number
  ) {
    let self = this;
    let offset_dict = this.buildingOffset;
    let offset_x = offset_dict[buildingName].offset_x * scale.x;
    let offset_y = offset_dict[buildingName].offset_y * scale.y;
    let offset_z = offset_dict[buildingName].offset_z * scale.z;

    let offset = new THREE.Vector3(offset_x, offset_y, offset_z);

    let cornerPosition = centerPosition.clone();
    cornerPosition.add(offset);

    let mtlPath = `./assets/model/building/${buildingName}.mtl`;
    let objPath = `./assets/model/building/${buildingName}.obj`;

    this.loadResourcePart.loadBuildingResource(mtlPath, objPath, cornerPosition, rotateY, scale,
      (buildingObj) => {
        self.scene.add(buildingObj);
        let building = {
          obj: buildingObj,
          box: new THREE.Box3().setFromObject(buildingObj),
        };
        self.buildingList.push(building);
      });
  }

  

  // debugCameraMove() {
  //   if (this.keyboardPressed['w'] == 1) {
  //     // W键
  //     this.camera.position.z -= 1;
  //   }
  //   if (this.keyboardPressed['s'] == 1) {
  //     // S键
  //     this.camera.position.z += 1;
  //   }
  //   if (this.keyboardPressed['a'] == 1) {
  //     // A键
  //     this.camera.position.x -= 1;
  //   }
  //   if (this.keyboardPressed['d'] == 1) {
  //     // D键
  //     this.camera.position.x += 1;
  //   }
  //   if (this.keyboardPressed['f'] == 1) {
  //     // F键
  //     this.camera.position.y += 1;
  //   }
  //   if (this.keyboardPressed['c'] == 1) {
  //     // C键
  //     this.camera.position.y -= 1;
  //   }
  // }

  loadAllRoads() {
    let self = this;
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
      let posX = i * 30;
      this.loadResourcePart.loadRoadResource(
        mtlPath,
        objPath,
        new THREE.Vector3(posX, 0, -30),
        0,
        new THREE.Vector3(10, 10, 10),
        (roadObj) => {
          self.scene.add(roadObj);

          let road = {
            obj: roadObj,
            box: new THREE.Box3().setFromObject(roadObj),
          };
          self.roadList.push(road);
        }
      );
    }
  }

  loadAllBuildings() {
    let allBuildings = [
      // "large_buildingA",
      // "large_buildingB",
      'large_buildingC',
      // "large_buildingD",
      // "large_buildingE",
      // "large_buildingF",
      // "large_buildingG",
      // "low_buildingA",
      // "low_buildingB",
      // "low_buildingC",
      // "low_buildingD",
      // "low_buildingE",
      // "low_buildingF",
      // "low_buildingG",
      // "low_buildingH",
      // "low_buildingI",
      // "low_buildingJ",
      // "low_buildingK",
      // "low_buildingL",
      // "low_buildingM",
      // "low_buildingN",
      // "low_wideA",
      // "low_wideB",
      // "roof_center",
      // "roof_corner",
      // "roof_overhang",
      // "roof_side",
      // "sign_billboard",
      // "sign_hospital",
      // "skyscraperA",
      // "skyscraperB",
      'skyscraperC',
      'skyscraperD',
      'skyscraperE',
      'skyscraperF',
      // "small_buildingA",
      // "small_buildingB",
      // "small_buildingC",
      // "small_buildingD",
      // "small_buildingE",
      // "small_buildingF",
      'tree_small',
      'tree_large',
    ];
    let self = this;

    for (let i = 0; i < allBuildings.length; i++) {
      let buildingName = allBuildings[i];
      let mtlPath = `./assets/model/building/${buildingName}.mtl`;
      let objPath = `./assets/model/building/${buildingName}.obj`;
      let posX = i * 30;
      this.loadResourcePart.loadBuildingResource(
        mtlPath,
        objPath,
        new THREE.Vector3(posX, 0, 5),
        0,
        new THREE.Vector3(10, 10, 10),
        (buildingObj) => {
          self.scene.add(buildingObj);
          let building = {
            obj: buildingObj,
            box: new THREE.Box3().setFromObject(buildingObj),
          };
          self.buildingList.push(building);
        }
      );
    }
  }

  loadGround() {
    let self = this;
    // 30 * 30
    let mtlPath = `./assets/model/other/ground.mtl`;
    let objPath = `./assets/model/other/ground.obj`;
    let x_width = 300;
    let z_width = 300;
    this.loadResourcePart.loadGroundResource(
      mtlPath,
      objPath,
      new THREE.Vector3(-x_width / 2, -1, z_width / 2),
      0,
      new THREE.Vector3(100, 2.4, 100),
      (groundObj) => {
        // self.scene.add(groundObj);
        self.ground = {
          obj: groundObj,
          box: new THREE.Box3().setFromObject(groundObj),
        };
      }
    );
  }


}
