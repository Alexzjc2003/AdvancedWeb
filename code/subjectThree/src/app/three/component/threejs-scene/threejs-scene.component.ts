import { Component, HostListener, OnInit } from '@angular/core';
import * as THREE from 'three';
import { Router, NavigationEnd } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { PhysicsService } from '@app/three/service/physics.service';
import { CameraService } from '@app/three/service/camera.service';
import { CarcontrolService } from '@app/three/service/carcontrol.service';

import { NotificationService } from '@app/three/service/notification.service';

import { LoadResourcePart } from './load-resource';
import { RemotePart } from './remote';
import { EnvironmentPart } from './environment';
import { NoticePart } from './notice';
import { ExamService } from '@app/three/service/exam.service';
import { RenderService } from '@app/three/service/render.service';

@Component({
  selector: 'app-threejs-scene',
  providers: [PhysicsService, NotificationService],
  templateUrl: './threejs-scene.component.html',
  styleUrl: './threejs-scene.component.css',
})
export class ThreejsSceneComponent implements OnInit {
  scene: THREE.Scene = new THREE.Scene();
  cameraService: CameraService = new CameraService();
  renderService: RenderService = new RenderService();
  clock: THREE.Clock = new THREE.Clock();

  ambientLight: THREE.AmbientLight = new THREE.AmbientLight();
  directionalLight: THREE.DirectionalLight = new THREE.DirectionalLight();

  model: any;
  model_name: string = '';

  keyboardPressed: { [key: string]: number };

  carcontrol: CarcontrolService = new CarcontrolService();

  globalScale: THREE.Vector3 = new THREE.Vector3(1, 1, 1);

  roomId: string = '';

  container: any;

  chat_msg: string = '';
  isTyping: boolean = false;

  constructor(
    private notification: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
    public physics: PhysicsService,
    private examService: ExamService,

    private loadResourcePart: LoadResourcePart,
    private remotePart: RemotePart,
    private environmentPart: EnvironmentPart,
    private noticePart: NoticePart
  ) {
    this.keyboardPressed = {};
  }

  ngOnInit(): void {
    let self = this;

    this.route.queryParamMap.subscribe((params) => {
      self.model_name = params.get('model')!;
      self.roomId = params.get('roomId')!;
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

    this.cameraService.initCam(
      75,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      100
    );

    this.renderService.updateScreenSize(
      this.container.clientWidth,
      this.container.clientHeight
    );

    this.container.appendChild(
      this.renderService.useSimpleRenderer().domElement
    );
    // this.container.appendChild(this.renderService.useComplexRenderer().domElement);

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
    this.remotePart.init_websocket();

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        console.log('sendDisconnect');
        this.remotePart.sendDisconnect();
        this.examService.endExam(
          (resp) => {},
          (resp) => {}
        );
      }
    });
  }

  sendChatMsg() {
    if (this.chat_msg == '') return;
    this.remotePart.sendChatMsg(this.chat_msg);
    this.chat_msg = '';
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

      self.renderService.updateScreenSize(width, height);
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

      let _gear = 0,
        _throttle = false,
        _turn = 0,
        _brake = false;
      if (this.keyboardPressed['w'] == 1) {
        // W键
        this.noticePart.showNotice('发动');
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
        this.noticePart.showNotice('转弯');
        _turn += 1;
      }
      if (this.keyboardPressed['d'] == 1) {
        // D键
        this.noticePart.showNotice('转弯');
        _turn -= 1;
      }
      if (this.keyboardPressed['e'] == 1) {
        // E键 - 弹窗测试
        this.notification.showNotification('This is a test message.');
      }
      if (this.keyboardPressed['z'] == 1) {
        // Z键 - 惩罚测试
        this.examService.addPunishment("AIRCRASH", "惩罚测试", 10, (resp)=>{}, (resp)=>{});
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
      this.carcontrol.setControl(dt, _gear, _throttle, _brake, _turn);
      this.physics.controlCar(this.carcontrol.getStatus());
      this.physics.step(dt);

      this.model.obj.position.copy(this.physics.getCarPosition());
      this.model.obj.quaternion.copy(this.physics.getCarRotation());

      this.cameraService.control(dt, _up, _right, _far);
      this.cameraService.follow(this.model.obj);

      this.physics.updateDebugger();
      this.remotePart.updateSocket(this.model);
      this.renderService.render(this.scene, this.cameraService.camera);
    };

    animate();
  }

  @HostListener('window:beforeunload', ['$event'])
  handleBeforeUnload(event: Event) {
    this.examService.endExam((resp)=>{}, (resp)=> {});
    // setTimeout(()=>{
    // console.log('before unload');
    // this.sendDisconnect();
    // },1000)
  }
}
