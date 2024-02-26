import * as THREE from 'three';

const clock = new THREE.Clock();



const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / innerHeight, 0.1, 100);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);

scene.add(cube);

camera.position.z = 5;


const animate = () => {
  // frame logic
  requestAnimationFrame(animate);
  let deltaTime = clock.getDelta();

  

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;



  // Draw call
  renderer.render(scene, camera);
}

animate();
