import * as THREE from '../../three.module.js';
import { OrbitControls } from '../../OrbitControls.js';

//miscellaneous
const scene = new THREE.Scene();

//camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 100, 1000);
camera.position.z = 1000;

//renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvaElemento,
    alpha: true
});

let vFOV = (camera.fov * Math.PI) / 180;
let height = 2 * Math.tan(vFOV / 2) * Math.abs(camera.position.z);
let width = height * camera.aspect;

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

renderer.render(scene, camera);

// light
const light = new THREE.AmbientLight(0xffffff, 2);
light.castShadow = true;
scene.add(light);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
directionalLight.position.set(0, 32, 64)
scene.add(directionalLight);

//fondo
const fondoGeometry = new THREE.BoxGeometry(window.innerWidth * 2, window.innerHeight * 2, 1);
const fondoMaterial = new THREE.MeshBasicMaterial({ color: "rgb(26, 26, 26)" });
const fondo = new THREE.Mesh(fondoGeometry, fondoMaterial);
fondo.visible = false;
fondo.name = "fondo";
fondo.position.set(0, 0, 0);
scene.add(fondo);

export {camera, renderer, scene, width, height}
