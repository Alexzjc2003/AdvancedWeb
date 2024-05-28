import { Component, OnInit } from '@angular/core';
import { ThreejsSceneComponent } from '../threejs-scene/threejs-scene.component';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { carNameList } from '../allCars';
import { Router } from '@angular/router';

import { LoadResourceService } from '../load-resource.service';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [ThreejsSceneComponent, CommonModule],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css'
})
export class MainPageComponent implements OnInit {
  carOptions: string[];

  scene: THREE.Scene = new THREE.Scene();
  camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera();
  renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
  clock: THREE.Clock = new THREE.Clock();

  ambientLight: THREE.AmbientLight = new THREE.AmbientLight();
  directionalLight: THREE.DirectionalLight = new THREE.DirectionalLight();

  model: any;
  model_name: string = "";

  loader: LoadResourceService = new LoadResourceService();


  globalScale: THREE.Vector3 = new THREE.Vector3(1, 1, 1);

  container: any;

  debug_mode: number = 1;

  constructor(private router: Router) {
    this.carOptions = carNameList;
  }

  ngOnInit(): void {
    this.initScene();
    this.renderScene();
  }

  isLeftColumn(index: number): boolean {
    return index % 2 === 0;
  }

  gotoThree() {
    this.router.navigate(['/scene'], { queryParams: { model: this.model_name } });
  }

  initScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xadd8e6);

    this.container = document.getElementById("main-model-preview");
    if (this.container == undefined) {
      console.log("container not found. use document instead.");
      this.container = document.body;
    }

    this.camera = new THREE.PerspectiveCamera(
      75,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      5000
    );

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);

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

    this.chooseModel("police");
    this.model_name = "police";
  }

  chooseModel(carName: string) {
    if (this.model != undefined) {
      this.scene.remove(this.model.obj);
      this.model = undefined;
    }
    this.model_name = carName;
    this.loadLocalCar(carName);
  }

  loadLocalCar(carName: string) {
    let self = this;
    let fbxPath = `./assets/model/cars/${carName}.fbx`;
    let texturePath = "./assets/model/cars/texture/colormap.png";
    this.loader.loadFbxTextureResource(fbxPath, texturePath, (carObj) => {
      carObj.position.set(0, 0, 0);

      const box = new THREE.Box3().setFromObject(carObj);
      const size = new THREE.Vector3();
      box.getSize(size);
      const f = 2 / size.x;
      carObj.scale.set(f, f, f);
      self.scene.add(carObj);
      self.model = {
        obj: carObj
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
