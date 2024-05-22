import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';
import { HostListener } from '@angular/core';

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

	model: any;

	roadOffset: {
		[key: string]: { offset_x: number; offset_y: number; offset_z: number; puzzle: any[] };
	};
	roadList: {
		obj: THREE.Object3D;
		box: THREE.Box3;
	}[];

	roadPosition: {
		scale: number[],
		clips: {
			name: string;
			x: number;
			y: number;
			z: number;
			rotate: number;
		}[]
	};

	keyboardPressed: { [key: string]: number };

	physics: PhysicsService = new PhysicsService();
	carcontrol: CarcontrolService = new CarcontrolService();
	io: WebSocketService = new WebSocketService();
	loader: LoadResourceService = new LoadResourceService();

	globalScale: THREE.Vector3 = new THREE.Vector3(1, 1, 1);

	socketId: string = "";
	remoteCars: Map<string, any> = new Map<string, any>();

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

		this.loadLocalCar("police");
		this.loadRoadEnvironment();
		// this.loadAllRoads();

		this.bindEventListener();

		this.init_websocket();
	}

	init_websocket() {
		let self = this;
		this.io.connect("ws://10.117.245.17:53000");
		this.io.onMessage("online").subscribe((obj: any) => {
			console.log(obj);
			self.socketId = obj.id;
		});

		this.io.onMessage("update").subscribe((obj: any) => {
			console.log(obj);
			self.handleUpdate(obj);
		});

		this.io.onMessage("offline").subscribe((obj: any) => {
			console.log(obj);
			self.handleOffline(obj.id);
		});
	}

	sendInit(){
		this.io.sendMsg("init", {
			"roomID": "testRoom",
			"model": "police",
			"position": {
				"x": this.model.obj.position.x, 
				"y": this.model.obj.position.y,
				"z": this.model.obj.position.z
			},
			"rotation": {
				"w": this.model.obj.quaternion.w,
				"x": this.model.obj.quaternion.x,
				"y": this.model.obj.quaternion.y,
				"z": this.model.obj.quaternion.z
			}
		});
	}

	sendDisconnect(){
		this.io.sendMsg("disconnect", {});
	}

	handleUpdate(remoteDataList: any[]){
		let self = this;
		for(let remoteData of remoteDataList){
			let remoteId = remoteData.id;
			if(remoteId == this.socketId){
				continue;
			}
			let centerPosition = remoteData.position;
			let quaternion = remoteData.quaternion;
			if(!this.remoteCars.has(remoteId)){
				this.loadRemoteCar(remoteData.model, (carObj) => {
					carObj.position.set(centerPosition.x, centerPosition.y, centerPosition.z);
					carObj.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);

					self.scene.add(carObj);
					self.remoteCars.set(remoteId, {
						"obj": carObj
					});
				})
			} else {
				let carObj = this.remoteCars.get(remoteId).obj;
				carObj.position.set(centerPosition.x, centerPosition.y, centerPosition.z);
				carObj.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
			}
		}
	}

	handleOffline(socketId){
		if(this.remoteCars.has(socketId)){
			this.scene.remove(this.remoteCars.get(socketId).obj);
			this.remoteCars.delete(socketId);
		}
	}

	updateSocket(){
		this.io.sendMsg("update", {
			"position": {
				"x": this.model.obj.position.x, 
				"y": this.model.obj.position.y,
				"z": this.model.obj.position.z
			},
			"rotation": {
				"w": this.model.obj.quaternion.w,
				"x": this.model.obj.quaternion.x,
				"y": this.model.obj.quaternion.y,
				"z": this.model.obj.quaternion.z
			}
		});
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

	@HostListener('window:beforeunload', ['$event'])
	handleBeforeUnload(event: Event) {
		console.log("before unload");
		this.sendDisconnect();
	}

	loadRemoteCar(carName: string, callback: (object: THREE.Object3D) => void) {
		let fbxPath = `./assets/model/cars/${carName}.fbx`;
		let texturePath = "./assets/model/cars/texture/colormap.png";
		this.loader.loadCarResource(fbxPath, texturePath, (carObj) => {
			const box = new THREE.Box3().setFromObject(carObj);
			const size = new THREE.Vector3();
			box.getSize(size);
			const f = 2 / size.x;
			carObj.scale.set(f, f, f);

			callback(carObj);
		});
	}

	loadLocalCar(carName: string) {
		let self = this;
		let fbxPath = `./assets/model/cars/${carName}.fbx`;
		let texturePath = "./assets/model/cars/texture/colormap.png";
		this.loader.loadCarResource(fbxPath, texturePath, (carObj) => {
			carObj.position.set(3, 3, 3);
			carObj.rotateY(Math.PI);
			
			const box = new THREE.Box3().setFromObject(carObj);
			const size = new THREE.Vector3();
			box.getSize(size);
			const f = 2 / size.x;
			carObj.scale.set(f, f, f);
			self.scene.add(carObj);
			self.model = {
				obj: carObj
			};

			self.physics.setCar(carObj);
			
			self.sendInit();
		});
	}

	loadRoadEnvironment() {
		let scale = new THREE.Vector3(this.roadPosition.scale[0], this.roadPosition.scale[1], this.roadPosition.scale[2])
		for (let i = 0; i < this.roadPosition.clips.length; i++) {
			let road = this.roadPosition.clips[i];
			this.loadRoad(
				road.name,
				new THREE.Vector3(road.x, road.y, road.z),
				scale,
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

			direction.multiplyScalar(6);
			direction.negate();

			this.updateSocket();

			this.camera.position.copy(
				direction.clone().add(this.model.obj.position).add(new THREE.Vector3(0, 4, 0))
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
		scale: THREE.Vector3,
		rotateY: number
	) {
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
}
