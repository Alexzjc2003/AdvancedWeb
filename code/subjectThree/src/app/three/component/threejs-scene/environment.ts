import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { LoadResourcePart } from './load-resource';

import { roadPosition } from '../../../data/roadPosition';
import { buildingPosition } from '../../../data/buildingPosition';
import { roadOffset } from '../../../data/roadOffset';
import { buildingOffset } from '../../../data/buildingOffset';
import { PhysicsService } from '@app/three/service/physics.service';


@Injectable({
  providedIn: 'root',
})
export class EnvironmentPart {
  scene: any;

  roadOffset: {
    [key: string]: {
      offset_x: number;
      offset_y: number;
      offset_z: number;
      puzzle: any[];
    };
  };

  buildingOffset: {
    [key: string]: {
      offset_x: number;
      offset_y: number;
      offset_z: number;
      puzzle: any[];
    };
  };

  roadList: {
    obj: THREE.Object3D;
    box: THREE.Box3;
  }[];

  buildingList: {
    obj: THREE.Object3D;
    box: THREE.Box3;
  }[];

  ground: any;

  roadPosition: {
    scale: number[];
    clips: {
      name: string;
      x: number;
      y: number;
      z: number;
      rotate: number;
    }[];
  };

  buildingPosition: {
    scale: number[];
    clips: {
      name: string;
      x: number;
      y: number;
      z: number;
      rotate: number;
    }[];
  };

  physics: any;

  constructor(private loadResourcePart: LoadResourcePart) {
    this.roadPosition = roadPosition;
    this.roadOffset = roadOffset;

    this.buildingPosition = buildingPosition;
    this.buildingOffset = buildingOffset;

    this.roadList = [];
    this.buildingList = [];
  }

  setScene(scene: THREE.Scene, physics: PhysicsService) {
    this.scene = scene;
    this.physics = physics;
  }

  loadEnvironment() {
    let roadScale = new THREE.Vector3(
      this.roadPosition.scale[0],
      this.roadPosition.scale[1],
      this.roadPosition.scale[2]
    );
    for (let i = 0; i < this.roadPosition.clips.length; i++) {
      let road = this.roadPosition.clips[i];
      this.loadRoad(
        road.name,
        new THREE.Vector3(road.x, road.y, road.z),
        roadScale,
        road.rotate
      );
    }

    let buildingScale = new THREE.Vector3(
      this.buildingPosition.scale[0],
      this.buildingPosition.scale[1],
      this.buildingPosition.scale[2]
    );
    for (let i = 0; i < this.buildingPosition.clips.length; i++) {
      let building = this.buildingPosition.clips[i];
      this.loadBuilding(
        building.name,
        new THREE.Vector3(building.x, building.y, building.z),
        buildingScale,
        building.rotate
      );
    }

    this.loadGround();
  }

  loadRoad(
    roadName: string,
    cornerPosition: THREE.Vector3,
    scale: THREE.Vector3,
    rotateY: number
  ) {
    let self = this;
    let offset_dict = this.roadOffset;
    let offset_x = offset_dict[roadName].offset_x * scale.x;
    let offset_y = offset_dict[roadName].offset_y * scale.y;
    let offset_z = offset_dict[roadName].offset_z * scale.z;

    let offset = new THREE.Vector3(offset_x, offset_y, offset_z);

    let centerPosition = cornerPosition.clone();
    centerPosition.add(offset);


    let mtlPath = `./assets/model/road/${roadName}.mtl`;
    let objPath = `./assets/model/road/${roadName}.obj`;

    this.loadResourcePart.loadRoadResource(mtlPath, objPath, centerPosition, rotateY, scale,
      (roadObj) => {
        self.scene.add(roadObj);

        let road = {
          obj: roadObj,
          box: new THREE.Box3().setFromObject(roadObj),
        };
        self.roadList.push(road);
      });

    let puzzles = offset_dict[roadName].puzzle;

    for (let puzzle of puzzles) {
      // console.log(puzzle['type'], puzzle['vectorX'], puzzle['vectorZ']);
      this.physics.addRoad(
        cornerPosition,
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



  loadBuilding(
    buildingName: string,
    cornerPosition: THREE.Vector3,
    scale: THREE.Vector3,
    rotateY: number
  ) {
    let self = this;
    let offset_dict = this.buildingOffset;
    let offset_x = offset_dict[buildingName].offset_x * scale.x;
    let offset_y = offset_dict[buildingName].offset_y * scale.y;
    let offset_z = offset_dict[buildingName].offset_z * scale.z;

    let offset = new THREE.Vector3(offset_x, offset_y, offset_z);

    let centerPosition = cornerPosition.clone();
    centerPosition.add(offset);

    let mtlPath = `./assets/model/building/${buildingName}.mtl`;
    let objPath = `./assets/model/building/${buildingName}.obj`;

    this.loadResourcePart.loadBuildingResource(mtlPath, objPath, centerPosition, rotateY, scale,
      (buildingObj) => {
        self.scene.add(buildingObj);
        let building = {
          obj: buildingObj,
          box: new THREE.Box3().setFromObject(buildingObj),
        };
        self.buildingList.push(building);
      });

    let puzzles = offset_dict[buildingName].puzzle;

    for (let puzzle of puzzles) {
      // console.log(puzzle['type'], puzzle['vectorX'], puzzle['vectorZ']);
      this.physics.addHouse(
        cornerPosition,
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

  loadAllRoads() {
    let self = this;
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
      let posX = i * 30;
      this.loadResourcePart.loadRoadResource(
        mtlPath,
        objPath,
        new THREE.Vector3(posX, 0, -30),
        0,
        new THREE.Vector3(10, 10, 10),
        (roadObj) => {
          self.scene.add(roadObj);

          let road = {
            obj: roadObj,
            box: new THREE.Box3().setFromObject(roadObj),
          };
          self.roadList.push(road);
        }
      );
    }
  }

  loadAllBuildings() {
    let allBuildings = [
      // "large_buildingA",
      // "large_buildingB",
      'large_buildingC',
      // "large_buildingD",
      // "large_buildingE",
      // "large_buildingF",
      // "large_buildingG",
      // "low_buildingA",
      // "low_buildingB",
      // "low_buildingC",
      // "low_buildingD",
      // "low_buildingE",
      // "low_buildingF",
      // "low_buildingG",
      // "low_buildingH",
      // "low_buildingI",
      // "low_buildingJ",
      // "low_buildingK",
      // "low_buildingL",
      // "low_buildingM",
      // "low_buildingN",
      // "low_wideA",
      // "low_wideB",
      // "roof_center",
      // "roof_corner",
      // "roof_overhang",
      // "roof_side",
      // "sign_billboard",
      // "sign_hospital",
      // "skyscraperA",
      // "skyscraperB",
      'skyscraperC',
      'skyscraperD',
      'skyscraperE',
      'skyscraperF',
      // "small_buildingA",
      // "small_buildingB",
      // "small_buildingC",
      // "small_buildingD",
      // "small_buildingE",
      // "small_buildingF",
      'tree_small',
      'tree_large',
    ];
    let self = this;

    for (let i = 0; i < allBuildings.length; i++) {
      let buildingName = allBuildings[i];
      let mtlPath = `./assets/model/building/${buildingName}.mtl`;
      let objPath = `./assets/model/building/${buildingName}.obj`;
      let posX = i * 30;
      this.loadResourcePart.loadBuildingResource(
        mtlPath,
        objPath,
        new THREE.Vector3(posX, 0, 5),
        0,
        new THREE.Vector3(10, 10, 10),
        (buildingObj) => {
          self.scene.add(buildingObj);
          let building = {
            obj: buildingObj,
            box: new THREE.Box3().setFromObject(buildingObj),
          };
          self.buildingList.push(building);
        }
      );
    }
  }

  loadGround() {
    let self = this;
    // 30 * 30
    let mtlPath = `./assets/model/other/ground.mtl`;
    let objPath = `./assets/model/other/ground.obj`;
    let x_width = 300;
    let z_width = 300;
    this.loadResourcePart.loadGroundResource(
      mtlPath,
      objPath,
      new THREE.Vector3(-x_width / 2, -1, z_width / 2),
      0,
      new THREE.Vector3(100, 2.4, 100),
      (groundObj) => {
        self.scene.add(groundObj);
        self.ground = {
          obj: groundObj,
          box: new THREE.Box3().setFromObject(groundObj),
        };
      }
    );

    this.physics.addRoad(
      new THREE.Vector3(-x_width / 2, 0, -z_width / 2),
      new THREE.Vector3(
        0, 0, z_width
      ),
      new THREE.Vector3(
        x_width, 0, 0
      )
    );
  }
}