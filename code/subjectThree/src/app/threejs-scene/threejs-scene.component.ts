import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

@Component({
  selector: 'app-threejs-scene',
  standalone: true,
  imports: [],
  templateUrl: './threejs-scene.component.html',
  styleUrl: './threejs-scene.component.css',
})
export class ThreejsSceneComponent implements OnInit {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  model: THREE.Object3D;
  carDisplay;
  road;
  keys;
  cameraPosition: THREE.Vector3;
  lookAtVector: THREE.Vector3;
  ambientLight: THREE.AmbientLight;
  directionalLight: THREE.DirectionalLight;
  carBox: THREE.Box3;
  carDisplayBox;
  roadBox;

  constructor() {}

  ngOnInit(): void {
    this.initScene();
    this.renderScene();
  }

  initScene(): void {
    // 创建场景
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xadd8e6);

    // 创建相机
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      5000
    );
    this.camera.position.y = 2;

    // 创建渲染器
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    let loader = new FBXLoader();
    this.model = undefined;

    this.carDisplay = [];
    this.carDisplayBox = [];
    this.road = [];
    this.roadBox = [];

    let component = this;
    loader.load('./assets/model/cars/police.fbx', function (loadedModel) {
      // 设置模型的初始位置
      loadedModel.position.set(0, 0, 0);

      // 添加纹理
      var textureLoader = new THREE.TextureLoader();
      textureLoader.load(
        './assets/model/cars/texture/colormap.png',
        function (texture) {
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
        }
      );

      component.model = loadedModel;
      component.carBox = new THREE.Box3().setFromObject(loadedModel);
      component.model.rotateY(Math.PI);
    });
    let carNameList = [
      'ambulance',
      'box',
      'cone-flat',
      'cone',
      'debris-bolt',
      'debris-bumper',
      'debris-door-window',
      'debris-door',
      'debris-drivetrain-axle',
      'debris-drivetrain',
      'debris-nut',
      'debris-plate-a',
      'debris-plate-b',
      'debris-plate-small-a',
      'debris-plate-small-b',
      'debris-spoiler-a',
      'debris-spoiler-b',
      'debris-tire',
      'delivery-flat',
      'delivery',
      'firetruck',
      'garbage-truck',
      'hatchback-sports',
      'police',
      'race-future',
      'race',
      'sedan-sports',
      'sedan',
      'suv-luxury',
      'suv',
      'taxi',
      'tractor-police',
      'tractor-shovel',
      'tractor',
      'truck-flat',
      'truck',
      'van',
      'wheel-dark',
      'wheel-default',
      'wheel-racing',
      'wheel-tractor-back',
      'wheel-tractor-dark-back',
      'wheel-tractor-dark-front',
      'wheel-tractor-front',
      'wheel-truck',
    ];

    for (let i = 0; i < carNameList.length; i++) {
      let carName = carNameList[i];
      let texturePath = './assets/model/cars/texture/colormap.png';
      let fbxPath = `./assets/model/cars/${carName}.fbx`;
      let posX = i * 300;
      let posZ = 600;
      this.loadCarDisplay(fbxPath, texturePath, posX, 0, posZ);
    }

    let roadNameList = [
      'bridge_pillar',
      'bridge_pillarWide',
      'construction_barrier',
      'construction_light',
      'construction_pylon',
      'light_curved',
      'light_curvedCross',
      'light_curvedDouble',
      'light_square',
      'light_squareCross',
      'light_squareDouble',
      'road_bend',
      'road_bendBarrier',
      'road_bendSidewalk',
      'road_bendSquare',
      'road_bendSquareBarrier',
      'road_bridge',
      'road_crossing',
      'road_crossroad',
      'road_crossroadBarrier',
      'road_crossroadLine',
      'road_crossroadPath',
      'road_curve',
      'road_curveBarrier',
      'road_curveIntersection',
      'road_curveIntersectionBarrier',
      'road_curvePavement',
      'road_drivewayDouble',
      'road_drivewayDoubleBarrier',
      'road_drivewaySingle',
      'road_drivewaySingleBarrier',
      'road_end',
      'road_endBarrier',
      'road_endRound',
      'road_endRoundBarrier',
      'road_intersection',
      'road_intersectionBarrier',
      'road_intersectionLine',
      'road_intersectionPath',
      'road_roundabout',
      'road_roundaboutBarrier',
      'road_side',
      'road_sideBarrier',
      'road_sideEntry',
      'road_sideEntryBarrier',
      'road_sideExit',
      'road_sideExitBarrier',
      'road_slant',
      'road_slantBarrier',
      'road_slantCurve',
      'road_slantCurveBarrier',
      'road_slantFlat',
      'road_slantFlatCurve',
      'road_slantFlatHigh',
      'road_slantHigh',
      'road_slantHighBarrier',
      'road_split',
      'road_splitBarrier',
      'road_square',
      'road_squareBarrier',
      'road_straight',
      'road_straightBarrier',
      'road_straightBarrierEnd',
      'tile_high',
      'tile_low',
      'tile_slant',
      'tile_slantHigh',
    ];

    for (let i = 0; i < roadNameList.length; i++) {
      let roadName = roadNameList[i];
      let mtlPath = `./assets/model/road/${roadName}.mtl`;
      let objPath = `./assets/model/road/${roadName}.obj`;
      let posX = i * 300;
      let posZ = i % 2 == 0 ? -600 : 0;
      this.loadRoad(mtlPath, objPath, posX, 0, posZ, 300, 300, 300);
    }

    // 如果不放大，每一块大小为3 * 3
    // for (let i = 1; i < 303; i++) {
    //   let numStr = i.toString().padStart(3, '0');
    //   let mtlPath = `./assets/model/road/roadTile_${numStr}.mtl`;
    //   let objPath = `./assets/model/road/roadTile_${numStr}.obj`;
    //   let posX = i * 300;
    //   let posZ = i % 2 == 0 ? -600 : 0;
    //   this.loadRoad(mtlPath, objPath, posX, 0, posZ, 100, 100, 100);
    // }

    // 平视
    // this.cameraPosition = new THREE.Vector3(0, 200, 500);
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
      if (this.model == undefined || this.road == undefined) {
        return;
      }
      let speed = 15;
      let deltaX = 0;
      let deltaZ = 0;

      if (this.keys['w']) {
        // W键
        deltaZ = -speed;
      }
      if (this.keys['s']) {
        // S键
        deltaZ = speed;
      }
      if (this.keys['a']) {
        // A键
        deltaX = -speed;
      }
      if (this.keys['d']) {
        // D键
        deltaX = speed;
      }

      this.model.position.x += deltaX;
      this.model.position.z += deltaZ;

      this.carBox.setFromObject(this.model);

      // 检查碰撞
      // if (this.roadBox && this.carBox.intersectsBox(this.roadBox)) {
      //   console.log('Collision detected!');
      //   this.model.position.x -= deltaX;
      //   this.model.position.z -= deltaZ;
      //   return;
      // }

      this.camera.position.copy(
        this.cameraPosition.clone().add(this.model.position)
      );
      this.camera.lookAt(this.lookAtVector.copy(this.model.position));

      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }

  loadRoad(
    mtlPath,
    objPath,
    positionX,
    positionY,
    positionZ,
    scaleX,
    scaleY,
    scaleZ
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
        component.road.push(object);
        component.roadBox.push(new THREE.Box3().setFromObject(object));
        component.scene.add(object);
      });
    });
  }

  loadCarDisplay(fbxPath, texturePath, positionX, positionY, positionZ) {
    let component = this;
    let loader = new FBXLoader();
    loader.load(fbxPath, function (loadedModel) {
      loadedModel.position.set(positionX, positionY, positionZ);

      var textureLoader = new THREE.TextureLoader();
      textureLoader.load(texturePath, function (texture) {
        var material = new THREE.MeshBasicMaterial({ map: texture });
        loadedModel.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            child.material = material;
          }
        });
        // 将模型添加到场景中
        component.scene.add(loadedModel);
      });

      component.carDisplay.push(loadedModel);
      component.carDisplayBox.push(new THREE.Box3().setFromObject(loadedModel));
    });
  }
}
