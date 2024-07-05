import * as THREE from "three";

export class RotatingCam {
  constructor(camera, scene, domElement) {
    this.camera = camera;
    this.scene = scene;
    this.domElement = domElement;
    this.rotationSpeed = 0.2; // speed
    this.radius = 200; // dist dari center
    this.angle = 0; 
    this.height = 200; // height

    this.enabled = false;

    this.initCameraPosition();
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  initCameraPosition() {
    this.camera.position.set(
      this.radius * Math.cos(this.angle),
      this.height,
      this.radius * Math.sin(this.angle)
    );
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
  }

  update(delta) {
    if (!this.enabled) return;

    this.angle += this.rotationSpeed * delta;
    this.camera.position.set(
      this.radius * Math.cos(this.angle),
      this.height,
      this.radius * Math.sin(this.angle)
    );
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
  }
}