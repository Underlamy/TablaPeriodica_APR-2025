import * as THREE from '../three.module.js'; 

const ElectronRenderer = new THREE.WebGLRenderer({
    canvas: canvaElectron,
    alpha: true,
});

const ProtonRenderer = new THREE.WebGLRenderer({
    canvas: canvaProton,
    alpha: true,
});

const NeutronRenderer = new THREE.WebGLRenderer({
    canvas: canvaNeutron,
    alpha: true,
});

function getWidthElectron() {
    return parseInt(window.getComputedStyle(document.getElementById("canvaElectron")).width);
}

function getHeightElectron() {
    return parseInt(window.getComputedStyle(document.getElementById("canvaElectron")).height);
}

function getWidthProton() {
    return parseInt(window.getComputedStyle(document.getElementById("canvaProton")).width);
}
function getHeightProton() {
    return parseInt(window.getComputedStyle(document.getElementById("canvaProton")).height);
}

function getWidthNeutron() {
    return parseInt(window.getComputedStyle(document.getElementById("canvaNeutron")).width);
}
function getHeightNeutron() {
    return parseInt(window.getComputedStyle(document.getElementById("canvaNeutron")).height);
}

ElectronRenderer.setPixelRatio(window.devicePixelRatio);
ElectronRenderer.setSize(getWidthElectron(), getHeightElectron());

ProtonRenderer.setPixelRatio(window.devicePixelRatio);
ProtonRenderer.setSize(getWidthProton(), getHeightProton());

NeutronRenderer.setPixelRatio(window.devicePixelRatio);
NeutronRenderer.setSize(getWidthNeutron(), getHeightNeutron());

const ModelosScene = new THREE.Scene();

const ElectronCamera = new THREE.PerspectiveCamera(75, getWidthElectron() / getHeightElectron(), 0.1, 1000);
const ProtonCamera = new THREE.PerspectiveCamera(75, getWidthProton() / getHeightProton(), 0.1, 1000);
const NeutronCamera = new THREE.PerspectiveCamera(75, getWidthNeutron() / getHeightNeutron(), 0.1, 1000);

const directionalLight3 = new THREE.DirectionalLight(0xffffff, 1);
const directionalLight4 = new THREE.DirectionalLight(0xffffff, 1);

directionalLight3.position.x = 50;
directionalLight3.position.y = 50;
ModelosScene.add(directionalLight3);

directionalLight4.position.x = -50;
directionalLight4.position.y = -50;
ModelosScene.add(directionalLight4);

let electron2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.8, 0), new THREE.MeshToonMaterial({ color: 0xEEEEEE }));
electron2.userData.angle = Math.floor(Math.random() * 360);
electron2.position.set(5, 5, 0);
ModelosScene.add(electron2);

let proton = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 0), new THREE.MeshToonMaterial({ color: 0x00F4FF}));
proton.userData.angle = Math.floor(Math.random() * 360);
proton.position.set(15, 5, 0);
ModelosScene.add(proton);

let neutron = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 0), new THREE.MeshToonMaterial({ color: 0xE500FF }));
neutron.userData.angle = Math.floor(Math.random() * 360);
neutron.position.set(25, 5, 0);
ModelosScene.add(neutron);

ElectronCamera.position.set(5, 5, 3);
ProtonCamera.position.set(15, 5, 3);
NeutronCamera.position.set(25, 5, 3);

export {electron2, proton, neutron,
    ElectronRenderer, ProtonRenderer, NeutronRenderer,
    ElectronCamera, ProtonCamera, NeutronCamera, ModelosScene};