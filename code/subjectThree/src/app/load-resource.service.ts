import { Injectable } from '@angular/core';

import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';


@Injectable({
  providedIn: 'root'
})
export class LoadResourceService {

  

  constructor() { 
    
  }

  loadCarResource(fbxPath, texturePath, callback: (object: THREE.Object3D) => void) {
    let loader = new FBXLoader();
    
    loader.load(fbxPath, function (object) {
      let textureLoader = new THREE.TextureLoader();
      textureLoader.load(texturePath, function (texture) {
          let material = new THREE.MeshBasicMaterial({ map: texture });

          object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
              child.material = material;
            }
          });
        }
      );

      object.rotateY(Math.PI);
      callback(object);
    });
  }

  loadRoadResource(mtlPath, objPath, callback: (object: THREE.Object3D) => void) {
    let mtlLoader = new MTLLoader();
    mtlLoader.load(mtlPath, function (materials) {
      materials.preload();
      let objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.load(objPath, function (object) {
        callback(object);
      });
    });
  }

}
