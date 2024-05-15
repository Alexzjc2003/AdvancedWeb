import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

@Component({
  selector: 'app-threejs-scene',
  standalone: true,
  imports: [],
  templateUrl: './threejs-scene.component.html',
  styleUrl: './threejs-scene.component.css'
})

export class ThreejsSceneComponent implements OnInit {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  model;
  keys;
  cameraPosition: THREE.Vector3;
  lookAtVector: THREE.Vector3;
  ambientLight: THREE.AmbientLight;
  directionalLight: THREE.DirectionalLight;

  constructor() { }

  ngOnInit(): void {
    this.initScene();
    this.renderScene();
  }

  initScene(): void {
    // 创建场景
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xadd8e6);

    // 创建相机
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.y = 2;

    // 创建渲染器
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    let loader = new FBXLoader();
    this.model = undefined;

    let component = this;

    loader.load('./assets/model/police.fbx', function (loadedModel) {
      // 设置模型的初始位置
      loadedModel.position.set(0, 0, 0);

      // 添加纹理
      var textureLoader = new THREE.TextureLoader();
      textureLoader.load('./assets/model/colormap.png', function (texture) {
        // 创建基础材质，并设置纹理
        var material = new THREE.MeshBasicMaterial({ map: texture });

        // 遍历模型的所有子对象并应用材质
        loadedModel.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            child.material = material;
          }
        });

        // 将模型添加到场景中
        component.scene.add(loadedModel);
      });

      component.model = loadedModel;
      component.model.rotateY(Math.PI);
    });

    let mtlLoader = new MTLLoader();
    mtlLoader.load('./assets/model/road/roadTile_030.mtl', function (materials) {
      materials.preload();
      let objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.load('./assets/model/road/roadTile_030.obj', function (object) {
        object.scale.set(100, 100, 100); // 设置模型的缩放
        object.position.set(0, 0, 0);
        component.scene.add(object);
      });
    });

    this.cameraPosition = new THREE.Vector3(0, 200, 500);
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

    this.keys = [];
    document.addEventListener('keydown', function (event) {
      component.keys[event.key] = true;
    });

    document.addEventListener('keyup', function (event) {
      component.keys[event.key] = false;
    });
  }

  renderScene(): void {
    const animate = () => {
      requestAnimationFrame(animate);
      if (this.model == undefined) {
        return;
      }

      if (this.keys['w']) { // W键
        this.model.position.z -= 30;
      }
      if (this.keys['s']) { // S键
        this.model.position.z += 30;
      }
      if (this.keys['a']) { // A键
        this.model.position.x -= 30;
      }
      if (this.keys['d']) { // D键
        this.model.position.x += 30;
      }

      this.camera.position.copy(this.cameraPosition.clone().add(this.model.position));
      this.camera.lookAt(this.lookAtVector.copy(this.model.position));

      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }
}
