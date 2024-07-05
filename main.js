import * as THREE from "three";
import { loadFBXModel, loadOBJModel, setSkySphere, setTransparency } from "./enviroment.js";
import { FreeCam } from "./freeCam.js";
import { StaticCam } from "./staticCam.js";
import { RotatingCam } from "./rotatingCam.js";
import { CharacterControls } from "./player.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { addCollisionBox } from "./enviroment.js";
import * as CANNON from "./cannon-es.js";
import CannonDebugger from "./cannon-es-debugger.js";


class Main {
  static characterControls;

  static init() {
    var canvasRef = document.getElementById("canvas");

    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({antialias: true,canvas: canvasRef,});
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x777777);
    this.renderer.shadowMap.enabled = true;
    document.body.appendChild(this.renderer.domElement);

    //
    // LOAD ENVIROMENT
    //
    setSkySphere(this.scene, "./resources/evening_field_2k.hdr"); // 
    loadFBXModel(this.scene, "./resources/farm.fbx"); // Map

    //
    // LOAD ENVIROMENT
    //

    //
    // COLLISION BOXES
    //
      this.collision();
        var groundMaterial = new CANNON.Material('ground');
        const ground = new CANNON.Box(new CANNON.Vec3(150, 1, 150));
        var groundBody = new CANNON.Body({ mass: 0, material: groundMaterial });
        groundBody.addShape(ground);
        groundBody.position.set(0, 23.5, 0);
          
        this._world.addBody(groundBody);

        const wallMap1 = new CANNON.Box(new CANNON.Vec3(1, 50, 80));
        var wallMapBody1 = new CANNON.Body({ mass: 0, material: groundMaterial });
        wallMapBody1.addShape(wallMap1);
        wallMapBody1.position.set(80, 23.5, 0);
          
        this._world.addBody(wallMapBody1);

        const wallMap2 = new CANNON.Box(new CANNON.Vec3(80, 50, 1));
        var wallMapBody2 = new CANNON.Body({ mass: 0, material: groundMaterial });
        wallMapBody2.addShape(wallMap2);
        wallMapBody2.position.set(0, 23.5, 80);
          
        this._world.addBody(wallMapBody2);

        const wallMap3 = new CANNON.Box(new CANNON.Vec3(1, 50, 80));
        var wallMapBody3 = new CANNON.Body({ mass: 0, material: groundMaterial });
        wallMapBody3.addShape(wallMap3);
        wallMapBody3.position.set(-80, 23.5, 0);
          
        this._world.addBody(wallMapBody3);

        const wallMap4 = new CANNON.Box(new CANNON.Vec3(80, 50, 1));
        var wallMapBody4 = new CANNON.Body({ mass: 0, material: groundMaterial });
        wallMapBody4.addShape(wallMap4);
        wallMapBody4.position.set(0, 23.5, -80);
          
        this._world.addBody(wallMapBody4);


        const Barn = new CANNON.Box(new CANNON.Vec3(38, 30, 25));
        var BarnBody = new CANNON.Body({ mass: 0, material: groundMaterial });
        
        BarnBody.addShape(Barn);
        BarnBody.position.set(-27, 23.5, -18);
        const quaternion = new CANNON.Quaternion();
        quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 60/360);
        BarnBody.quaternion.copy(quaternion);
        this._world.addBody(BarnBody);


        const grass = new CANNON.Box(new CANNON.Vec3(15.5, 10, 6));
        var grassBody = new CANNON.Body({ mass: 0, material: groundMaterial });
        
        grassBody.addShape(grass);
        grassBody.position.set(45, 23.5, 67);

        this._world.addBody(grassBody);

        const rock = new CANNON.Box(new CANNON.Vec3(7, 14, 9));
        var rockBody = new CANNON.Body({ mass: 0, material: groundMaterial });
        
        rockBody.addShape(rock);
        rockBody.position.set(68, 23.5, 56);

        this._world.addBody(rockBody);

        const fence = new CANNON.Cylinder(35, 35, 30, 100);
        var fenceBody = new CANNON.Body({ mass: 0, material: groundMaterial });
        
        fenceBody.addShape(fence);
        fenceBody.position.set(41, 24, 0);
        const quaternion2 = new CANNON.Quaternion();
        quaternion2.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 1.5/360);
        fenceBody.quaternion.copy(quaternion2);

        this._world.addBody(fenceBody);


        

    //
    // SET Transparency
    setTransparency("./resources/farm.fbx",1);
    //

    //  
    // CAMERA SETUP
    //
    this.camera1 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera1.position.set(0, 50, 2);

    this.camera2 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera2.position.set(100, 50, 350);

    this.camera3 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera3.position.set(0, 10, 10);

    this.camera4 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera4.position.set(100, 60, 30);

    this.camera5 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera5.position.set(0, 200, 500);


    this.freeCam = new FreeCam(this.camera1, this.scene, this.renderer.domElement);
    this.staticCam1 = new StaticCam(this.camera2, this.scene, this.renderer.domElement);
    this.staticCam3 = new StaticCam(this.camera4, this.scene, this.renderer.domElement);
    this.rotatingCam = new RotatingCam(this.camera5, this.scene, this.renderer.domElement);
    //  
    // CAMERA SETUP
    //


    this.domElement = this.renderer.domElement;
    this.domElement.addEventListener("click", () => {
      this.domElement.requestPointerLock();
    });

    document.addEventListener("pointerlockchange", () => {
      if (document.pointerLockElement === this.domElement) {
        this.enableCurrentCamera();
      } else {
        this.disableAllCameras();
      }
    });

    document.addEventListener("keydown", this.onKeyDown.bind(this), false);

    //
    // PLANE SETUP
    //
    var textureLoader = new THREE.TextureLoader();
    var texture = textureLoader.load("./resources/plane_texture/GroundGrassGreen002_COL_2K.jpg"); // Replace with the path to your texture image

    // Set up circular plane with texture
    var circle = new THREE.Mesh(
      new THREE.CircleGeometry(1000, 500), // 500 is the radius, 32 is the number of segments
      new THREE.MeshPhongMaterial({ map: texture })
    );
    circle.rotation.set(-Math.PI / 2, 0, 0);
    circle.position.set(0, -1, 0);
    circle.receiveShadow = true;
    circle.castShadow = true;
    this.scene.add(circle);
    //
    // PLANE SETUP
    //

    //
    // LIGHTIHNG SETUP
    //
    // const ambientLight = new THREE.AmbientLight(0xffffff);
    // this.scene.add(ambientLight);

    // const hemisphereLight = new THREE.HemisphereLight(0xb1e1ff, 0xb97a20, 0.1);
    // this.scene.add(hemisphereLight);

    // var directionalLight = new THREE.DirectionalLight(0xffffff);
    // directionalLight.castShadow = true;
    // directionalLight.position.set(3, 10, 10);
    // directionalLight.target.position.set(0, 0, 0);
    // this.scene.add(directionalLight);
    // this.scene.add(directionalLight.target);


    let light = new THREE.DirectionalLight(0xFFFFFF)
    light.position.set(100, 100, 100)
    light.target.position.set(0,0,0)
    light.castShadow = true;
    light.shadow.mapSize.width = 2048
    light.shadow.mapSize.height = 2048
    light.shadow.camera.near = 1
    light.shadow.camera.far = 500
    light.shadow.camera.left = 200
    light.shadow.camera.right = -200
    light.shadow.camera.top = 200
    light.shadow.camera.bottom = -200
    this.scene.add(light)

    light = new THREE.AmbientLight(0x404040, 0.5)
    this.scene.add(light)

    
    //
    // LIGHTIHNG SETUP
    //

    //
    // CHARACTER SETUP
    //
    this.currentCamera = this.camera1;
    this.currentController = this.freeCam;
    this.enableCurrentCamera();

    new GLTFLoader().load("./resources/Farmer.glb", (gltf) => {
      const model = gltf.scene;
      model.scale.set(8, 8, 8);
      // model.position.set(20, 0, 340);
      model.position.set(40, 22, 40);
      model.traverse((object) => {
        if (object.isMesh) object.castShadow = true;
      });
      this.scene.add(model);

      const mixer = new THREE.AnimationMixer(model);
      const animationsMap = new Map();
      gltf.animations
        .filter((a) => a.name !== "TPose")
        .forEach((a) => {
          animationsMap.set(a.name, mixer.clipAction(a));
        });
        
        
        const physics = new CANNON.Vec3(3, 3, 3);
        const shape = new CANNON.Box(physics);
        const body = new CANNON.Body({ mass: 10000, type: CANNON.Body.DYNAMIC});
        body.addShape(shape);
        body.position.set(40, 24, 40)
        this.playerPhysics = body;
        this._world.addBody(body);

      this.characterControls = new CharacterControls(
        model,
        mixer,
        animationsMap,
        this.camera3,
        "Idle",
        this.scene, // Pass the scene to CharacterControls
        this.playerPhysics,
      );
    });



    //
    // CHARACTER SETUP
    //
  }
  
  static collision(){
    this._world = new CANNON.World();
    this._world.gravity.set(0, -100, 0);

    this._cannonDebugger = new CannonDebugger(this.scene, this._world, {
        onInit: (mesh) => {
            mesh.visible = false;
            document.addEventListener("keydown", (event) => {
                if (event.key === "f") {
                    mesh.visible = !mesh.visible;
                }
            });
        },
    });
  }
  static enableCurrentCamera() {
    if (this.currentController && this.currentController != this.characterControls) {
      this.currentController.enable();
    }
  }

  static disableAllCameras() {
    this.freeCam.disable();
    this.staticCam1.disable();
    this.staticCam3.disable();
    this.rotatingCam.disable();
  }

  static onKeyDown(event) {
    switch (event.code) {
      case "Digit1":
        this.switchToCamera(this.camera1, this.freeCam);
        break;
      case "Digit2":
        this.switchToCamera(this.camera2, this.staticCam1);
        break;
      case "Digit3":
        if (this.characterControls) {
          this.switchToCamera(this.camera3, this.characterControls);
        }
        break;
      case "Digit4":
        this.switchToCamera(this.camera4, this.staticCam3);
        break;
      case "Digit5":
        this.switchToCamera(this.camera5, this.rotatingCam);
        break;
    }
  }

  static switchToCamera(camera, controller) {
    this.disableAllCameras();
    this.currentCamera = camera;
    this.currentController = controller;
    this.enableCurrentCamera();

    // if (this.characterControls && (camera === this.camera6 || camera === this.camera3)) {
    //   this.characterControls.setCamera(camera);
    // }
  }

  static render(dt) {
    this.renderer.render(this.scene, this.currentCamera);
    this._world.step(dt);

    //this._cannonDebugger.update();
  }
}

var clock = new THREE.Clock();
Main.init();

function animate() {
  const delta = clock.getDelta();

  // if (this.characterControls) {
  //   this.characterControls.update(delta); // Ensure character controls are always updated
  // }

  if (Main.currentController && Main.currentController.update) {
    Main.currentController.update(delta);
  }

  Main.render(delta);
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
