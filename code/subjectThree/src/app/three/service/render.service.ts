import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root',
})
export class RenderService {
  firstRenderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
  secondRenderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();

  framebuffer: THREE.WebGLRenderTarget = new THREE.WebGLRenderTarget(1, 1);
  screenMaterial: THREE.Material = new THREE.MeshBasicMaterial({
    map: this.framebuffer.texture,
  });

  screen: THREE.Scene = new THREE.Scene();
  orthoCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 100);

  simple: boolean = true;

  constructor() {
    this.firstRenderer.setRenderTarget(this.framebuffer);
    this.secondRenderer.setRenderTarget(null);
    let _scene = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      this.screenMaterial
    );
    _scene.position.set(0, 0, -2);
    // _scene.rotateY(Math.PI / 3);
    this.screen.background = new THREE.Color(0xffffff);

    let _wheel = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load(
          './assets/icons/steering-wheel.svg'
        ),
        transparent: true,
      })
    );
    _wheel.position.set(0, 0, -1);
    // this.screen.add(_wheel);
    this.screen.add(_scene);
  }

  public render(scene: THREE.Scene, camera: THREE.Camera) {
    this.firstRenderer.render(scene, camera);
    if (this.simple) return;
    this.secondRenderer.render(this.screen, this.orthoCam);
  }

  public updateScreenSize(width: number, height: number) {
    this.framebuffer.setSize(width, height);
    this.firstRenderer.setSize(width, height);
    this.secondRenderer.setSize(width, height);
  }

  public useSimpleRenderer(): THREE.Renderer {
    this.firstRenderer.setRenderTarget(null);
    this.simple = true;
    return this.firstRenderer;
  }

  public useComplexRenderer(): THREE.Renderer {
    this.firstRenderer.setRenderTarget(this.framebuffer);
    this.simple = false;
    return this.secondRenderer;
  }
}
