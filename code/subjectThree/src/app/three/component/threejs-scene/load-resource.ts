import { Injectable } from '@angular/core';
import { LoadResourceService } from '@app/three/service/load-resource.service';
import * as THREE from 'three';



@Injectable({
    providedIn: 'root',
})
export class LoadResourcePart {
    constructor(private loader: LoadResourceService) { }

    loadRoadResource(
        mtlPath: string,
        objPath: string,
        position: THREE.Vector3,
        rotateY: number,
        scale: THREE.Vector3,
        onSuccess: (resp: THREE.Object3D) => void
    ) {
        this.loader.loadMtlObjResource(mtlPath, objPath, (roadObj) => {
            roadObj.scale.set(scale.x, scale.y, scale.z);
            roadObj.position.set(position.x, position.y, position.z);
            roadObj.rotateY(Math.PI * rotateY);
            onSuccess(roadObj);
        });
    }

    loadGroundResource(
        mtlPath: string,
        objPath: string,
        position: THREE.Vector3,
        rotateY: number,
        scale: THREE.Vector3,
        onSuccess: (obj: THREE.Object3D) => void
    ) {
        this.loader.loadMtlObjResource(mtlPath, objPath, (groundObj) => {
            groundObj.scale.set(scale.x, scale.y, scale.z);
            groundObj.position.set(position.x, position.y, position.z);
            groundObj.rotateY(Math.PI * rotateY);
            onSuccess(groundObj);
        });
    }

    loadBuildingResource(
        mtlPath: string,
        objPath: string,
        position: THREE.Vector3,
        rotateY: number,
        scale: THREE.Vector3,
        onSuccess: (obj: THREE.Object3D) => void
    ) {
        this.loader.loadMtlObjResource(mtlPath, objPath, (buildingObj) => {
            buildingObj.scale.set(scale.x, scale.y, scale.z);
            buildingObj.position.set(position.x, position.y, position.z);
            buildingObj.rotateY(Math.PI * rotateY);
            onSuccess(buildingObj);
        });
    }

    loadCarResouce(carName: string, onSuccess: (object: THREE.Object3D) => void) {
        let fbxPath = `./assets/model/cars/${carName}.fbx`;
        let texturePath = './assets/model/cars/texture/colormap.png';
        this.loader.loadFbxTextureResource(fbxPath, texturePath, (carObj) => {
            const box = new THREE.Box3().setFromObject(carObj);
            const size = new THREE.Vector3();
            box.getSize(size);
            const f = 2 / size.x;
            carObj.scale.set(f, f, f);

            onSuccess(carObj);
        });
    }
}