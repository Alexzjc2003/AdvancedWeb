import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';
import { carNameList } from '../../../data/allCars';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { LoadResourceService } from '@app/three/service/load-resource.service';
import { WebSocketService } from '@app/utils/service/websocket.service';
import { ExamService } from '@app/three/service/exam.service';
import { ConfirmDialogComponent } from '@app/utils/component/confirm-dialog/confirm-dialog.component';
import { UserService } from '@app/user/service/user.service';

@Component({
  selector: 'app-hall',
  templateUrl: './hall.component.html',
  styleUrl: './hall.component.css',
})
export class HallComponent implements OnInit {
  carOptions: string[];
  roomOptions: { [key: string]: number };

  scene: THREE.Scene = new THREE.Scene();
  camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera();
  renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
  clock: THREE.Clock = new THREE.Clock();

  ambientLight: THREE.AmbientLight = new THREE.AmbientLight();
  directionalLight: THREE.DirectionalLight = new THREE.DirectionalLight();

  model: any;
  model_name: string = '';
  model_index: number = 0;

  loader: LoadResourceService = new LoadResourceService();

  globalScale: THREE.Vector3 = new THREE.Vector3(1, 1, 1);

  container: any;

  io: WebSocketService = new WebSocketService();

  constructor(private router: Router, private examService: ExamService, public dialog: MatDialog, private userService: UserService) {
    this.carOptions = carNameList;
    this.roomOptions = {};
  }

  ngOnInit(): void {
    this.init_websocket();
    this.initScene();
    this.renderScene();
  }

  prev() {
    let total = this.carOptions.length;
    this.model_index = (this.model_index - 1 + total) % total;
    this.model_name = this.carOptions[this.model_index];
    this.chooseModel(this.model_name);
  }

  next() {
    let total = this.carOptions.length;
    this.model_index = (this.model_index + 1) % total;
    this.model_name = this.carOptions[this.model_index];
    this.chooseModel(this.model_name);
  }

  init_websocket() {
    this.io.connect('ws://10.117.245.17:53000/hall');
    // this.io.connect("wss://p.jingyijun.xyz/hall");
    this.io.onMessage('sendRooms').subscribe((obj: any) => {
      this.handleNewRooms(obj.rooms);
    });
  }

  gotoThree(roomId: string) {
    let userInfo = this.userService.getUserDetail();
    let is_passed = userInfo.is_passed;
    if (is_passed) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: { title: "提示", message: "是否正式上路？" }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.startExam(roomId, true);
        } else if (result === false) {
          this.startExam(roomId, false);
        } else {
          console.log('dialog closed');
        }
      });
    } else {
      this.startExam(roomId, false);
    }
  }

  startExam(roomId: string, isOfficialDriving: boolean) {
    let self = this;
    this.examService.startExam(
      (resp) => {
        self.router.navigate(['/scene'], {
          queryParams: {
            model: this.model_name,
            roomId: roomId,
          },
        });
      },
      (resp) => { 
        console.log(resp);
      },
      isOfficialDriving
    );
  }

  handleNewRooms(roomMap: { [key: string]: string[] }) {
    console.log(roomMap);
    for (let roomId in roomMap) {
      this.roomOptions[roomId] = roomMap[roomId].length;
    }
  }

  createRoom() {
    this.io.sendMsg('createRooms', {});
  }

  initScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xadd8e6);

    this.container = document.getElementById('main-model-preview');
    if (this.container == undefined) {
      console.log('container not found. use document instead.');
      this.container = document.body;
    }

    this.camera = new THREE.PerspectiveCamera(
      75,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      5000
    );

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );

    this.container.appendChild(this.renderer.domElement);

    this.camera.position.copy(new THREE.Vector3(3, 2, 3));
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    // 添加环境光
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(this.ambientLight);

    // 添加方向光
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    this.directionalLight.position.set(10, 10, 10);
    this.scene.add(this.directionalLight);

    let axes = new THREE.AxesHelper(2000);
    this.scene.add(axes);

    this.chooseModel('police');
    this.model_name = 'police';
  }

  chooseModel(carName: string) {
    if (this.model != undefined) {
      this.scene.remove(this.model.obj);
      this.model = undefined;
    }
    this.loadLocalCar(carName);
  }

  loadLocalCar(carName: string) {
    let self = this;
    let fbxPath = `./assets/model/cars/${carName}.fbx`;
    let texturePath = './assets/model/cars/texture/colormap.png';
    this.loader.loadFbxTextureResource(fbxPath, texturePath, (carObj) => {
      carObj.position.set(0, 0, 0);

      const box = new THREE.Box3().setFromObject(carObj);
      const size = new THREE.Vector3();
      box.getSize(size);
      const f = 2 / size.x;
      carObj.scale.set(f, f, f);
      self.scene.add(carObj);
      self.model = {
        obj: carObj,
      };
    });
  }

  renderScene(): void {
    const animate = () => {
      requestAnimationFrame(animate);
      if (this.model != undefined) {
        this.model.obj.rotation.y += 0.01; // 不断旋转模型
      }
      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }
}
