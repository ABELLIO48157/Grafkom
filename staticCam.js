import * as THREE from "three";

export class StaticCam {
  constructor(camera, scene, domElement) {
    this.camera = camera;
    this.scene = scene;
    this.domElement = domElement;
    this.lookSpeed = 0.002;

    this.enabled = false;

    this.rotation = new THREE.Euler(0, 0, 0, "YXZ");
    this.quaternion = new THREE.Quaternion();

    this.initEventListeners();

    this.originalFOV = this.camera.fov;
    this.zoomedFOV = this.originalFOV / 2;
    this.targetFOV = this.originalFOV;
    this.isZoomed = false;
    this.zoomDuration = 0.5; // seconds
    this.zoomProgress = 0;
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  initEventListeners() {
    this.domElement.addEventListener("mousemove", this.onMouseMove.bind(this), false);
    document.addEventListener("keydown", this.onKeyDown.bind(this), false);
    document.addEventListener("keyup", this.onKeyUp.bind(this), false);
  }

  onMouseMove(event) {
    if (!this.enabled) return;

    const deltaX = -event.movementX * this.lookSpeed;
    const deltaY = -event.movementY * this.lookSpeed;

    // Apply the rotations using quaternions
    this.quaternion.setFromEuler(this.rotation);
    const quaternionX = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      deltaX
    );
    const quaternionY = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      deltaY
    );

    this.quaternion.multiplyQuaternions(quaternionX, this.quaternion);
    this.quaternion.multiplyQuaternions(this.quaternion, quaternionY);

    this.rotation.setFromQuaternion(this.quaternion);

    this.camera.quaternion.copy(this.quaternion);
  }

  onKeyDown(event) {
    if (event.key === "q") {
      this.zoomIn();
    }
  }

  onKeyUp(event) {
    if (event.key === "q") {
      this.zoomOut();
    }
  }

  zoomIn() {
    if (!this.isZoomed) {
      this.targetFOV = this.zoomedFOV;
      this.zoomProgress = 0;
      this.isZoomed = true;
    }
  }

  zoomOut() {
    if (this.isZoomed) {
      this.targetFOV = this.originalFOV;
      this.zoomProgress = 0;
      this.isZoomed = false;
    }
  }

  update(delta) {
    if (!this.enabled) return;

    // Smooth zoom logic
    if (this.camera.fov !== this.targetFOV) {
      this.zoomProgress += delta / this.zoomDuration;
      if (this.zoomProgress > 1) this.zoomProgress = 1;

      const newFOV = THREE.MathUtils.lerp(
        this.camera.fov,
        this.targetFOV,
        this.zoomProgress
      );
      this.camera.fov = newFOV;
      this.camera.updateProjectionMatrix();
    }
  }
}
