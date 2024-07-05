import * as THREE from "three";

export class FreeCam {
  constructor(camera, scene, domElement) {
    this.camera = camera;
    this.scene = scene;
    this.domElement = domElement;
    this.moveSpeed = 50; // Increase the move speed
    this.lookSpeed = 0.002; // Adjust look speed if necessary

    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.moveUp = false;
    this.moveDown = false;

    this.enabled = false;

    this.rotation = new THREE.Euler(0, 0, 0, "YXZ");
    this.quaternion = new THREE.Quaternion();
    this.direction = new THREE.Vector3();
    this.velocity = new THREE.Vector3();

    this.initDrone();
    this.initEventListeners();
  }

  initDrone() {
    this.drone = new THREE.Object3D();
    this.scene.add(this.drone);
    this.drone.add(this.camera);
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  initEventListeners() {
    document.addEventListener("keydown", this.onKeyDown.bind(this), false);
    document.addEventListener("keyup", this.onKeyUp.bind(this), false);
    this.domElement.addEventListener("mousemove", this.onMouseMove.bind(this), false);
  }

  onKeyDown(event) {
    switch (event.code) {
      case "KeyW":
        this.moveForward = true;
        break;
      case "KeyS":
        this.moveBackward = true;
        break;
      case "KeyA":
        this.moveLeft = true;
        break;
      case "KeyD":
        this.moveRight = true;
        break;
      case "KeyE":
        this.moveUp = true;
        break;
      case "KeyQ":
        this.moveDown = true;
        break;
    }
  }

  onKeyUp(event) {
    switch (event.code) {
      case "KeyW":
        this.moveForward = false;
        break;
      case "KeyS":
        this.moveBackward = false;
        break;
      case "KeyA":
        this.moveLeft = false;
        break;
      case "KeyD":
        this.moveRight = false;
        break;
      case "KeyE":
        this.moveUp = false;
        break;
      case "KeyQ":
        this.moveDown = false;
        break;
    }
  }

  onMouseMove(event) {
    if (!this.enabled) return;

    const deltaX = -event.movementX * this.lookSpeed;
    const deltaY = -event.movementY * this.lookSpeed;

    // Apply the rotations using quaternions
    this.quaternion.setFromEuler(this.rotation);
    const quaternionX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), deltaX);
    const quaternionY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), deltaY);

    this.quaternion.multiplyQuaternions(quaternionX, this.quaternion);
    this.quaternion.multiplyQuaternions(this.quaternion, quaternionY);

    this.rotation.setFromQuaternion(this.quaternion);

    this.drone.quaternion.copy(this.quaternion);
  }

  update(delta) {
    if (!this.enabled) return;

    this.velocity.set(0, 0, 0);

    if (this.moveForward) this.velocity.z -= this.moveSpeed * delta;
    if (this.moveBackward) this.velocity.z += this.moveSpeed * delta;
    if (this.moveLeft) this.velocity.x -= this.moveSpeed * delta;
    if (this.moveRight) this.velocity.x += this.moveSpeed * delta;
    if (this.moveUp) this.velocity.y += this.moveSpeed * delta;
    if (this.moveDown) this.velocity.y -= this.moveSpeed * delta;

    this.drone.translateX(this.velocity.x);
    this.drone.translateY(this.velocity.y);
    this.drone.translateZ(this.velocity.z);
  }
}
