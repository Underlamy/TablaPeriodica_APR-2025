import * as THREE from '../three.module.js'; 
import { OrbitControls } from '../OrbitControls.js';

const renderer = new THREE.WebGLRenderer({
    canvas: canvaElemento,
    alpha: true,
});

let canvas = document.getElementById("canvaElemento");
let canvasParent = document.getElementById("canvasParent");
canvas.style.width = window.getComputedStyle(canvasParent).width;
canvas.style.height = window.getComputedStyle(canvasParent).height;

function getWidth() {
    return parseInt(window.getComputedStyle(canvasParent).width);
}

function getHeight() {
    return parseInt(window.getComputedStyle(canvasParent).height);
}

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(getWidth(), getHeight());

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, getWidth() / getHeight(), 0.1, 1000);
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.x = 5;
camera.position.y = 5;

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);

directionalLight.position.x = 50;
directionalLight.position.y = 50;
scene.add(directionalLight);

directionalLight2.position.x = -50;
directionalLight2.position.y = -50;
scene.add(directionalLight2);

let volumen = document.getElementById("masaAtomica").dataset.value;
let radius = (Math.pow((3 * volumen / (4 * Math.PI)), (1 / 3))) * 2;
let protonCount = Number(document.getElementById("protones").dataset.value);
let neutronCount = Number(document.getElementById("neutrones").dataset.value);

let point = new THREE.Mesh();
point.position.set(5, 5, 0);
scene.add(point);

const geometryProton = new THREE.IcosahedronGeometry(1.5, 0);
const materialProton = new THREE.MeshToonMaterial({ color: 0x00F4FF });
let protons = new THREE.InstancedMesh(geometryProton, materialProton, protonCount);
point.add(protons);

const dummyProton = new THREE.Object3D();
for (let cont = 0; cont <= protonCount; cont++) {
    var randomDirection = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
    var radiusR = Math.random() * radius;
    var direction = randomDirection.multiplyScalar(radiusR);
    dummyProton.position.set(direction.x, direction.y, direction.z);
    dummyProton.userData.angle = Math.floor(Math.random() * 360);

    dummyProton.updateMatrix();
    protons.setMatrixAt(cont, dummyProton.matrix);
}

const geometryNeutron = new THREE.IcosahedronGeometry(1.5, 0);
const materialNeutron = new THREE.MeshToonMaterial({ color: 0xE500FF });
let neutrons = new THREE.InstancedMesh(geometryNeutron, materialNeutron, neutronCount);
point.add(neutrons);

const dummyNeutron = new THREE.Object3D();
for (let cont = 0; cont <= neutronCount; cont++) {
    var randomDirection = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
    var radiusR = Math.random() * radius;
    var direction = randomDirection.multiplyScalar(radiusR);
    dummyNeutron.position.set(direction.x, direction.y, direction.z);
    dummyNeutron.userData.angle = Math.floor(Math.random() * 360);

    dummyNeutron.updateMatrix();
    neutrons.setMatrixAt(cont, dummyNeutron.matrix);
}

let torus = [];

const geometryElectron = new THREE.IcosahedronGeometry(1.5, 0);
const materialElectron = new THREE.MeshToonMaterial({ color: 0xEEEEEE });
const materialTorus = new THREE.MeshBasicMaterial({ color: "rgb(151,151,151)" });

for (let cont1 = 1; cont1 <= document.getElementById("periodo").getAttribute("data-value"); cont1++) {
    torus[cont1] = new THREE.Mesh(new THREE.TorusGeometry((10 + (10 * cont1)), 0.2, 16, 100), materialTorus);
    torus[cont1].position.set(5, 5, 0);
    scene.add(torus[cont1]);
    let maxElec = nivelesEnergeticos(cont1);

    torus[cont1].userData.angleX = Math.random() * 0.1;
    torus[cont1].userData.angleY = Math.random() * 0.1;
    torus[cont1].userData.angleZ = Math.random() * 0.1;

    if (cont1 == document.getElementById("periodo").getAttribute("data-value")) {
        camera.position.z = 40 + (10 * cont1);
    }

    let electrons = new THREE.InstancedMesh(geometryElectron, materialElectron, maxElec);
    const dummyElectron = new THREE.Object3D();
    torus[cont1].add(electrons);

    for (let cont = 0; cont <= maxElec; cont++) {
        dummyElectron.angle = Math.floor(Math.random() * 360);
        dummyElectron.position.set((Math.cos(dummyElectron.angle * 0.017453292519943295) * (10 + (10 * cont1))), (Math.sin(dummyElectron.angle * 0.017453292519943295) * (10 + (10 * cont1))));

        dummyElectron.updateMatrix();
        electrons.setMatrixAt(cont, dummyElectron.matrix);
    }
}

document.getElementById("canvaElemento").addEventListener("mousedown", function () {
    document.getElementById("canvaElemento").style.cursor = "grabbing";
});

document.getElementById("canvaElemento").addEventListener("mouseup", function () {
    document.getElementById("canvaElemento").style.cursor = "default";
});

renderer.render(scene, camera);

function nivelesEnergeticos(p) {
    let nivelE = ["1s", "2s", "2p", "3s", "3p", "4s", "3d", "4p", "5s", "4d", "5p", "6s", "4f", "5d", "6p", "7s", "5f", "6d", "7p", "6f", "7d", "7f"];
    let periodos = [0, 0, 0, 0, 0, 0, 0, 0];
    let electonesTotal = 0;
    let electrones = document.getElementById("electrones").getAttribute("data-value");

    for (let cont = 0; cont < nivelE.length; cont++) {
        let periodo = nivelE[cont].slice(0, 1);
        let letra = nivelE[cont].slice(1, 2);

        switch (letra) {
            case "s":
                letra = 2;
                break;

            case "p":
                letra = 6;
                break;

            case "d":
                letra = 10;
                break;

            case "f":
                letra = 14;
                break;
        }

        for (let cont2 = 0; cont2 < letra; cont2++) {
            electonesTotal++;
            periodos[periodo]++;

            if (electonesTotal >= electrones) {
                cont = nivelE.length;
                cont2 = letra;
            }
        }
    }
    return periodos[p];
}

export {camera, torus, renderer, point, scene};