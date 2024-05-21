import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

import { roadPosition } from '../roadPosition';
import { roadOffset } from '../roadOffset';
import { CarspeedService } from '../carspeed.service';

@Component({
	selector: 'app-threejs-scene',
	standalone: true,
	imports: [],
	providers: [CarspeedService],
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

	model: {
		"obj": THREE.Object3D,
		"box": THREE.Box3
	} | undefined;

	roadList: {
		"obj": THREE.Object3D,
		"box": THREE.Box3
	}[];

	roadPosition: { "name": string, "x": number, "y": number, "z": number, "rotate": number }[];
	roadOffset: { [key: string]: { "offset_x": number, "offset_y": number, "offset_z": number } };

	keyboardPressed: { [key: string]: number };

	carspeed: CarspeedService = new CarspeedService({
		ratioFraction: 10,
		ratioBrake: 500,
		ratioAccelerate: 200,
		ratioSpeed: 10,
		ratioTurn: 10,

		maxSpeedForward: 60,
		maxSpeedBackword: -10,
		maxTurnDegree: 100,
		minTurnDegree: 80,

		modelLength: 100,
	});

	constructor() {
		this.roadPosition = roadPosition;
		this.roadOffset = roadOffset;

		this.roadList = [];
		this.keyboardPressed = {
			"w": 0,
			"a": 0,
			"s": 0,
			"d": 0
		};
	}

	ngOnInit(): void {
		this.roadPosition = roadPosition;
		this.roadOffset = roadOffset;
		this.initScene();
		this.renderScene();
		// this.carspeed = CarspeedService
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
		this.cameraPosition = new THREE.Vector3(0, 200, 500);
		// 俯视
		// this.cameraPosition = new THREE.Vector3(0, 1200, 0);

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

		this.bindEventListener();
	}

	loadLocalCar() {
		let loader = new FBXLoader();
		this.model = undefined;

		let component = this;
		loader.load('./assets/model/cars/police.fbx', function (object) {
			object.position.set(100, 150, 300);
			object.scale.set(0.6, 0.6, 0.6);

			let textureLoader = new THREE.TextureLoader();
			textureLoader.load('./assets/model/cars/texture/colormap.png',
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
				"obj": object,
				"box": new THREE.Box3().setFromObject(object)
			};
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
			// let speed = 30;
			// let deltaX = 0;
			// let deltaZ = 0;

			if (this.keyboardPressed['w'] == 1) {
				// W键
				// deltaZ = -speed;
				this.carspeed.status.isAccelerating += 1;
			}
			if (this.keyboardPressed['s'] == 1) {
				// S键
				// deltaZ = speed;
				this.carspeed.status.isAccelerating -= 1;
			}
			if (this.keyboardPressed['a'] == 1) {
				// A键
				// deltaX = -speed;
				this.carspeed.status.isTurning += 1;
			}
			if (this.keyboardPressed['d'] == 1) {
				// D键
				// deltaX = speed;
				this.carspeed.status.isTurning -= 1;
			}

			// this.model.position.x += deltaX;
			// this.model.position.z += deltaZ;

			let dt = this.clock.getDelta();
			let [_pos, _dir] = this.carspeed.getNextPosDir(
				dt,
				this.model["obj"].position,
				this.model["obj"].rotation
			);
			this.model["obj"].position.copy(_pos);
			this.model["obj"].rotation.set(_dir.x, _dir.y, _dir.z);

			this.model["box"].setFromObject(this.model["obj"]);
			for (let road of this.roadList) {
				if (road["box"] && this.model["box"].intersectsBox(road["box"])) {
					console.log('Collision detected!');
					return;
				}
			}

			this.camera.position.copy(
				this.cameraPosition.clone().add(this.model["obj"].position)
			);
			this.camera.lookAt(this.lookAtVector.copy(this.model["obj"].position));

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
					"obj": object,
					"box": new THREE.Box3().setFromObject(object)
				};
				component.roadList.push(road);
			});
		});
	}

	loadRoad(roadName: string, positionX: number, positionY: number, positionZ: number, rotateY: number) {
		let offset_scale = 300
		let scaleX = 300;
		let scaleY = 300;
		let scaleZ = 300;

		let offset_dict = this.roadOffset;
		let offset_x = offset_dict[roadName]['offset_x'] * (scaleX / offset_scale);
		let offset_y = offset_dict[roadName]['offset_y'] * (scaleY / offset_scale);
		let offset_z = offset_dict[roadName]['offset_z'] * (scaleZ / offset_scale);

		let mtlPath = `./assets/model/road/${roadName}.mtl`;
		let objPath = `./assets/model/road/${roadName}.obj`;
		this.loadRoadResource(
			mtlPath,
			objPath,
			positionX + offset_x,
			positionY + offset_y,
			positionZ + offset_z,
			rotateY,
			scaleX,
			scaleY,
			scaleZ
		);
	}
}
