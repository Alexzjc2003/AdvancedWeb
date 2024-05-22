import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

import { roadPosition } from '../roadPosition';

import { PhysicsService } from '../physics.service';
import { CarcontrolService } from '../carcontrol.service';
import { WebSocketService } from '../websocket.service';
import { NotificationService } from '../notification.service';
import { LoadResourceService } from '../load-resource.service';

import { roadOffset } from '../roadOffset';

@Component({
	selector: 'app-threejs-scene',
	standalone: true,
	imports: [],
	providers: [PhysicsService, NotificationService],
	templateUrl: './threejs-scene.component.html',
	styleUrl: './threejs-scene.component.css',
})
export class ThreejsSceneComponent implements OnInit {
	scene: THREE.Scene = new THREE.Scene();
	camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera();
	renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
	clock: THREE.Clock = new THREE.Clock();

	lookAtVector: THREE.Vector3 = new THREE.Vector3();
	ambientLight: THREE.AmbientLight = new THREE.AmbientLight();
	directionalLight: THREE.DirectionalLight = new THREE.DirectionalLight();

	model:
		| {
			obj: THREE.Object3D;
			// box: THREE.Box3;
		}
		| undefined;

	roadOffset: {
		[key: string]: { offset_x: number; offset_y: number; offset_z: number; puzzle: any[] };
	};
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

	keyboardPressed: { [key: string]: number };

	physics: PhysicsService = new PhysicsService();
	carcontrol: CarcontrolService = new CarcontrolService();
	io: WebSocketService = new WebSocketService();
	loader: LoadResourceService = new LoadResourceService();

	constructor(private notification: NotificationService) {
		this.roadPosition = roadPosition;
		this.roadOffset = roadOffset;

		this.roadList = [];
		this.keyboardPressed = {
			w: 0,
			a: 0,
			s: 0,
			d: 0,
			e: 0,
		};
	}

	ngOnInit(): void {
		this.roadPosition = roadPosition;

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

		// this.init_websocket();
	}

	init_websocket() {
		this.io.connect("ws://10.117.245.17:53000");
		this.io.onMessage("setId").subscribe((msg: string) => {
			console.log(`receive: ${msg}`);
		})
		// this.io.sendMsg(this.socketId, "connect", "");
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
				new THREE.Vector3(posX + 150, -150, 0),
				0,
				new THREE.Vector3(300, 300, 300)
			);
		}
	}

	loadLocalCar() {
		let self = this;
		this.loader.loadLocalCar((carObj) => {
			carObj.position.set(200, 50, 200);
			carObj.scale.set(0.6, 0.6, 0.6);
			self.scene.add(carObj);
			self.model = {
				obj: carObj
			};
			self.physics.setCar(carObj);
		});

	}

	loadRoadEnvironment() {
		for (let i = 0; i < this.roadPosition.length; i++) {
			let road = this.roadPosition[i];
			this.loadRoad(
				road.name,
				new THREE.Vector3(road.x, road.y, road.z),
				road.rotate
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
				_turn = 0;
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
				_turn -= 1;
			}
			if (this.keyboardPressed['d'] == 1) {
				// D键
				_turn += 1;
			}
			if (this.keyboardPressed['e'] == 1) {
				// E键 - 弹窗测试
				this.notification.showNotification("This is a test message.");
			}

			let dt = this.clock.getDelta();
			this.carcontrol.setControl(dt, _gear, _throttle, false, _turn);
			this.physics.controlCar(this.carcontrol.getStatus())
			this.physics.step(dt);

			this.model.obj.position.copy(this.physics.getCarPosition());
			this.model.obj.quaternion.copy(this.physics.getCarRotation());

			const direction = new THREE.Vector3();
			this.model.obj.getWorldDirection(direction);

			direction.multiplyScalar(300);
			direction.negate();

			this.camera.position.copy(
				direction.clone().add(this.model.obj.position).add(new THREE.Vector3(0, 150, 0))
			);
			this.camera.lookAt(this.lookAtVector.copy(this.model.obj.position));

			this.renderer.render(this.scene, this.camera);
		};

		animate();
	}

	loadRoadResource(
		mtlPath: string,
		objPath: string,
		position: THREE.Vector3,
		rotateY: number,
		scale: THREE.Vector3
	) {
		let self = this;
		this.loader.loadRoadResource(mtlPath, objPath, (roadObj) => {
			roadObj.scale.set(scale.x, scale.y, scale.z);
			roadObj.position.set(position.x, position.y, position.z);
			roadObj.rotateY(Math.PI * rotateY);
			self.scene.add(roadObj);
			let road = {
				obj: roadObj,
				box: new THREE.Box3().setFromObject(roadObj)
			};
			self.roadList.push(road);
		});
	}

	loadRoad(
		roadName: string,
		centerPosition: THREE.Vector3,
		rotateY: number
	) {
		let offset_scale = 300;
		let scale = new THREE.Vector3(300, 300, 300);

		let offset_dict = this.roadOffset;
		let offset_x = offset_dict[roadName].offset_x * (scale.x / offset_scale);
		let offset_y = offset_dict[roadName].offset_y * (scale.y / offset_scale);
		let offset_z = offset_dict[roadName].offset_z * (scale.z / offset_scale);

		let offset = new THREE.Vector3(offset_x, offset_y, offset_z);


		let cornerPosition = centerPosition.clone();
		cornerPosition.add(offset);

		let mtlPath = `./assets/model/road/${roadName}.mtl`;
		let objPath = `./assets/model/road/${roadName}.obj`;

		this.loadRoadResource(
			mtlPath,
			objPath,
			cornerPosition,
			rotateY,
			scale
		);

		let puzzles = offset_dict[roadName].puzzle;

		for (let puzzle of puzzles) {
			// console.log(puzzle['type'], puzzle['vectorX'], puzzle['vectorZ']);
			this.physics.addRoad(
				centerPosition,
				new THREE.Vector3(
					puzzle.vectorZ[0],
					puzzle.vectorZ[1],
					puzzle.vectorZ[2]
				),
				new THREE.Vector3(
					puzzle.vectorX[0],
					puzzle.vectorX[1],
					puzzle.vectorX[2]
				)
			);
		}
	}
}
