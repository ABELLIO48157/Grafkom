// enviroment.js
import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";


export function setSkySphere(scene, imagePath) {
  let hdrTexture = new RGBELoader().load(imagePath);

  let skySphereGeometry = new THREE.SphereGeometry(300, 60, 60);
  let skySphereMaterial = new THREE.MeshPhongMaterial({
    map: hdrTexture,
  });

  skySphereMaterial.side = THREE.BackSide;
  let skySphereMesh = new THREE.Mesh(skySphereGeometry, skySphereMaterial);

  // Set the scale of the sky sphere mesh
  skySphereMesh.scale.set(2, 2, 2);

  scene.add(skySphereMesh);
}

export function loadFBXModel(scene, imagePath, scale = { x: 0.1, y: 0.1, z: 0.1 }, position = { x: 0, y: 0, z: 0 }, rotation = { x: 0, y: 0, z: 0 }) {
  const loader = new FBXLoader();
  loader.load(
    imagePath, // Path to your FBX file
    (object) => {
      object.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      object.scale.set(scale.x, scale.y, scale.z); // Adjust the scale as needed
      object.position.set(position.x, position.y, position.z);
      object.rotation.set(rotation.x, rotation.y, rotation.z);

      scene.add(object);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
      console.error("An error happened", error);
    }
  );
}

export function loadOBJModel(scene, objPath, mtlPath, scale = { x: 0.1, y: 0.1, z: 0.1 }, position = { x: 0, y: 0, z: 0 }, rotation = { x: 0, y: 0, z: 0 }) {
  const mtlLoader = new MTLLoader();
  mtlLoader.load(
    mtlPath,
    (materials) => {
      materials.preload();

      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.load(
        objPath,
        (object) => {
          object.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          object.scale.set(scale.x, scale.y, scale.z);
          object.position.set(position.x, position.y, position.z);
          object.rotation.set(rotation.x, rotation.y, rotation.z);

          scene.add(object);
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
        },
        (error) => {
          console.error("An error happened", error);
        }
      );
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
      console.error("An error happened", error);
    }
  );
}

export function setTransparency(object, opacity = 1.0) {
  if (object.material) {
    object.material.transparent = opacity < 1.0;
    object.material.opacity = opacity;
  }
}

export function addCollisionBox(scene, position = { x: 0, y: 0, z: 0 }, size = { width: 1, height: 1, depth: 1 }, color = 0xff0000, visible = true, rotation = { x: 0, y: 0, z: 0 }) {
  const geometry = new THREE.BoxGeometry(size.width, size.height, size.depth);
  const material = new THREE.MeshBasicMaterial({ color: color, visible: visible });
  const box = new THREE.Mesh(geometry, material);

  box.position.set(position.x, position.y, position.z);
  box.rotation.set(rotation.x, rotation.y, rotation.z);

  const box3 = new THREE.Box3().setFromObject(box);
  box.userData.boundingBox = box3;

  //box3.translate(rotation)

  scene.add(box);

  if (visible) {
    const boxHelper = new THREE.Box3Helper(box3, color);
    scene.add(boxHelper);
  }

  box.updateMatrixWorld(); // Ensure matrix world is updated
  box3.setFromObject(box, true); // Update bounding box based on the mesh's world matrix
}
