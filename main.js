import * as THREE from 'three';
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

import { processInput, onKeyUp, onKeyDown } from './scripts/control.js';

const clock = new THREE.Clock();


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 5;


const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.tabIndex = 0;

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);

scene.add(cube);


const PLC = new PointerLockControls(camera, renderer.domElement);




renderer.domElement.addEventListener('keydown', onKeyDown);
renderer.domElement.addEventListener('keyup', onKeyUp);



renderer.domElement.addEventListener("click",
  () => { PLC.lock(); PLC.connect() });


document.body.appendChild(renderer.domElement);




const animate = () => {
  // frame logic
  requestAnimationFrame(animate);


  let deltaTime = clock.getDelta();
  processInput(deltaTime, camera);


  // Draw call
  renderer.render(scene, camera);
}

animate();
