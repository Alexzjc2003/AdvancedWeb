import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';
import { Router, NavigationEnd } from '@angular/router';
import { ActivatedRoute } from '@angular/router';



import { PhysicsService } from '@app/three/service/physics.service'
import { CameraService } from '@app/three/service/camera.service';
import { CarcontrolService } from '@app/three/service/carcontrol.service';

import { NotificationService } from '@app/three/service/notification.service';
import { LoadResourceService } from '@app/three/service/load-resource.service';



import { KnowledgeService } from '@app/three/service/knowledge.service';
import { UserService } from '@app/user/service/user.service';
import { LoadResourcePart } from './load-resource';
import { RemotePart } from './remote';
import { EnvironmentPart } from './environment';

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

  

  keyboardPressed: { [key: string]: number };

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
    private remotePart: RemotePart,
    private environmentPart: EnvironmentPart,
    public physics: PhysicsService
  ) {
    

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
    this.environmentPart.setScene(this.scene, this.physics);

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
    this.environmentPart.loadEnvironment();
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

  


}
