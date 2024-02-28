import { Vector3 } from "three";

let movement = {
  left: false,
  right: false,
  up: false,
  down: false,
  forward: false,
  backward: false
};
let direction = new Vector3();


const onKeyDown = (event) => {
  // console.log(event.code);
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW':
      movement.forward = true;
      break;

    case 'ArrowLeft':
    case 'KeyA':
      movement.left = true;
      break;

    case 'ArrowDown':
    case 'KeyS':
      movement.backward = true;
      break;

    case 'ArrowRight':
    case 'KeyD':
      movement.right = true;
      break;

    case 'Space':
      movement.up = true;
      break;

    case 'ShiftLeft':
      movement.down = true;
      break;
  }
};

const onKeyUp = (event) => {
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW':
      movement.forward = false;
      break;

    case 'ArrowLeft':
    case 'KeyA':
      movement.left = false;
      break;

    case 'ArrowDown':
    case 'KeyS':
      movement.backward = false;
      break;

    case 'ArrowRight':
    case 'KeyD':
      movement.right = false;
      break;

    case 'Space':
      movement.up = false;
      break;

    case 'ShiftLeft':
      movement.down = false;
      break;
  }
};

const processInput = (deltaTime, camera) => {
  direction.x = Number(movement.right) - Number(movement.left);
  direction.z = Number(movement.forward) - Number(movement.backward);
  direction.y = Number(movement.up) - Number(movement.down);
  direction.normalize();
  // console.log(direction)

  // camera.translateOnAxis(direction, deltaTime);
  let velocity = 5;
  let _dir = camera.getWorldDirection(new Vector3());
  let _dir_front = new Vector3(_dir.x, 0, _dir.z).normalize();
  let _dir_up = camera.up.clone().normalize();
  let _dir_right = new Vector3().crossVectors(_dir, _dir_up).normalize();
  let _mov = (_dir_front.multiplyScalar(direction.z))
    .add(_dir_right.multiplyScalar(direction.x))
    .add(_dir_up.multiplyScalar(direction.y))
    .multiplyScalar(velocity * deltaTime);

  camera.position.x += _mov.x;
  camera.position.y += _mov.y;
  camera.position.z += _mov.z;
}

export { processInput, onKeyUp, onKeyDown }