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
import { SnackbarService } from '@app/utils/service/snackbar.service';
import { UserService } from '@app/user/service/user.service';

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
  frame: number = 0;

  ambientLight: THREE.AmbientLight = new THREE.AmbientLight();
  directionalLight: THREE.DirectionalLight = new THREE.DirectionalLight();

  model: any;
  model_name: string = '';

  keyboardPressed: { [key: string]: number };

  carcontrol: CarcontrolService = new CarcontrolService();

  globalScale: THREE.Vector3 = new THREE.Vector3(1, 1, 1);

  roomId: string = '';

  container!: HTMLElement | null;

  chat_msg: string = '';
  isTyping: boolean = false;
  privateToID: string = '';

  punishmentCoolDown: { [key: string]: boolean } = {
    Unknown: true,
    OverSpeed: true,
    IllegalParking: true,
    NoBelts: true,
    FlameOut: true,
    RedLight: true,
    NoLicensePlate: true,
    CRASH: true,
    AIRCRASH: true,
    PHONING: true,
    FREQUENTLYBEEP: true,
    INCORRECTLIGHT: true,
  };

  constructor(
    private notification: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
    public physics: PhysicsService,
    private examService: ExamService,
    private userService: UserService,
    private snackBarService: SnackbarService,

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
    this.remotePart.setRoom(this.roomId, this.scene, this.carcontrol);
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
        if (event.url.startsWith('/scene')) {
          return;
        }
        this.exitFrame();
        console.log('sendDisconnect' + event.url);
        this.remotePart.sendDisconnect();
        this.endExam(false);
      }
    });
  }

  endExam(normalExit: boolean) {
    this.examService.endExam(
      (resp) => {
        this.snackBarService.showMessage(resp.info, 'sucess');
        console.log('is_passed: ', resp.is_driver);
        this.userService.setUserDetail('is_passed', resp.is_driver);
      },
      (resp) => { 
        this.snackBarService.showMessage("endExam: 服务器出错了...", "error");
      },
      normalExit
    );
  }

  setSteerWindow() {
    let outer = document.getElementById('three-container');
    let inner = document.getElementById('steer-container');

    if (outer != null && inner != null) {
      var rect = outer.getBoundingClientRect();
      console.log(rect.bottom, rect.right);
      console.log(inner.offsetWidth);
      inner.style.top = (rect.bottom - inner.offsetHeight) + 'px';
      inner.style.left = (rect.right - inner.offsetWidth) + 'px';
    }
  }

  sendChatMsg() {
    if (this.chat_msg == '') return;
    this.remotePart.sendChatMsg(
      this.chat_msg,
      this.selectedType,
      this.roomId,
      this.privateToID
    );
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
      self.carcontrol.bindCar(self.physics.car);
      carObj.add(self.carcontrol.turningSign);
      console.log(carObj);
      self.remotePart.sendInit(self.model, self.model_name);
    });
  }

  bindEventListener() {
    let self = this;

    window.addEventListener('resize', () => {
      const width = self.container?.clientWidth!;
      const height = self.container?.clientHeight!;

      self.renderService.updateScreenSize(width, height);
      self.cameraService.camera.aspect = width / height;
      self.cameraService.camera.updateProjectionMatrix();
      self.setSteerWindow();
    });

    window.addEventListener('scroll', () => {
      self.setSteerWindow();
    });

    document.addEventListener('keydown', function (event) {
      if (self.isTyping) {
        return;
      }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
      }
      // console.log(event.key);
      self.keyboardPressed[event.key] = 1;
    });

    document.addEventListener('keyup', function (event) {
      if (self.isTyping) {
        return;
      }
      self.keyboardPressed[event.key] = 0;
    });
  }

  addPunishment(punishmentType: string, reason: string, score: number = 10) {
    let self = this;
    if (!this.punishmentCoolDown[punishmentType]) {
      return;
    }
    self.punishmentCoolDown[punishmentType] = false;
    setTimeout(() => {
      self.punishmentCoolDown[punishmentType] = true;
    }, 3000);
    console.log(`${punishmentType} triggered.`);
    this.examService.addPunishment(
      punishmentType,
      reason,
      score,
      (resp) => { },
      (resp) => { }
    );
  }

  renderScene(): void {
    const animate = () => {
      this.frame = requestAnimationFrame(animate);
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
      if (this.keyboardPressed['b'] == 1) {
        _brake = true;
      }
      if (this.keyboardPressed['e'] == 1) {
        // E键 - 弹窗测试
        this.notification.showNotification('This is a test message.');
      }
      if (this.keyboardPressed['z'] == 1) {
        // Z键 - 惩罚测试
        this.addPunishment('AIRCRASH', '惩罚测试');
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

      if (this.keyboardPressed['ArrowLeft']) {
        this.carcontrol.turnLight(1);
      }
      if (this.keyboardPressed['ArrowRight']) {
        this.carcontrol.turnLight(-1);
      }
      if (this.keyboardPressed['n']) {
        // this.carcontrol.beep();
        this.remotePart.sendEvent('beep', this.roomId);
      }
      if (this.keyboardPressed['r']) {
        this.physics.initCar();
      }

      let dt = this.clock.getDelta();
      this.carcontrol.setControl(dt, _gear, _throttle, _brake, _turn);
      this.physics.controlCar(this.carcontrol.getStatus());
      this.physics.step(dt);

      this.model.obj.position.copy(this.physics.getCarPosition());
      this.model.obj.quaternion.copy(this.physics.getCarRotation());

      // overspeed
      const SPEED_LIMIT = 40;
      const AIRCRASH_SPEED_LIMIT = 100;
      if (
        this.carcontrol.getStatus().speed > SPEED_LIMIT &&
        this.carcontrol.getStatus().speed < AIRCRASH_SPEED_LIMIT
      ) {
        this.addPunishment('OverSpeed', '超速');
      } else if (this.carcontrol.getStatus().speed > AIRCRASH_SPEED_LIMIT) {
        console.log(this.carcontrol.getStatus().speed);
        this.addPunishment('AIRCRASH', '坠机', 100);
      }

      // turning light
      const TUNNING_LIMIT = 10;
      const TURNING_SPEED_LIMIT = 10;
      if (
        Math.abs(this.carcontrol.getStatus().rotation) > TUNNING_LIMIT &&
        !this.carcontrol.isLightCorrect() &&
        this.carcontrol.getStatus().speed > TURNING_SPEED_LIMIT
      ) {
        console.log(this.carcontrol.getStatus().speed);
        this.addPunishment('INCORRECTLIGHT', '转向灯错误');
      }

      if (
        this.isTyping &&
        this.carcontrol.getStatus().speed > TURNING_SPEED_LIMIT
      ) {
        this.addPunishment('PHONING', '驾驶中打电话', 1);
      }

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
    this.endExam(false);
    // setTimeout(()=>{
    // console.log('before unload');
    // this.sendDisconnect();
    // },1000)
  }

  @HostListener('window:load', ['$event'])
  handleLoad(event: Event) {
    this.examService.startExam(
      (resp) => { },
      (resp) => { },
      false
    );
  }

  exit() {
    if (window.confirm('Do you really want to finish driving?')) {
      this.endExam(true);
      this.remotePart.sendDisconnect();
      this.exitFrame();
      this.router.navigate(['/hall']);
    }
  }

  exitFrame() {
    cancelAnimationFrame(this.frame);
  }

  chatType: string[] = ['room', 'private', 'global', 'ai'];
  selectedType: string = this.chatType[0];
}
