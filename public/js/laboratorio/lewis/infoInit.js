import * as THREE from '../../three.module.js';
import {elemento} from './functions/interactive.js';
import {scene, renderer} from './init.js';

let object3D, idInfo;

const rendererInfo = new THREE.WebGLRenderer({
    canvas: canvaInfo,
    alpha: true,
});

const canvasInfo = document.getElementById("canvaInfo");
const objectInfo = document.getElementsByClassName("objectInfo")[0];

function getWidthInfo() {
    return parseInt(window.getComputedStyle(canvasInfo).width);
}

function getHeightInfo() {
    return parseInt(window.getComputedStyle(canvasInfo).height);
}

rendererInfo.setPixelRatio(window.devicePixelRatio);
//rendererInfo.setSize(getWidth(), getHeight());

window.addEventListener("resize", () => {
    cameraInfo.aspect = getWidthInfo() / getHeightInfo();
    cameraInfo.updateProjectionMatrix();
}, false);

const sceneInfo = new THREE.Scene();
const cameraInfo = new THREE.PerspectiveCamera(75, getWidthInfo() / getHeightInfo(), 0.1, 1000);
const cameraCompound = new THREE.PerspectiveCamera(75, getWidthInfo() / getHeightInfo(), 0.1, 1000);

const lightInfo = new THREE.AmbientLight(0xffffff, 2);
lightInfo.castShadow = true;

const directionalLightInfo = new THREE.DirectionalLight(0xFFFFFF, 1);

const geometryInfo = new THREE.IcosahedronGeometry(10, 0);
const materialInfo = new THREE.MeshToonMaterial({ color: "rgb(0, 0, 0)" });
object3D = new THREE.Mesh(geometryInfo, materialInfo);
object3D.position.set(0, 0, 0);
sceneInfo.add(object3D);

directionalLightInfo.position.set(0, 32, 64)
sceneInfo.add(directionalLightInfo);
sceneInfo.add(lightInfo);

cameraInfo.position.x = 0;
cameraInfo.position.y = 30;



function info(id, titule, texte) {
    idInfo = id;

    if (idInfo != undefined) {
		if(elemento[id].elemento){
			let objectInfo = document.getElementsByClassName("objectInfo")[0];
			objectInfo.setAttribute("id", "info" + id);

			if (object3D != undefined) {
				sceneInfo.remove(object3D);
				object3D = undefined;
			}

			object3D = scene.getObjectById(id).clone(false);
			object3D.name = "nucleo";
			sceneInfo.add(object3D);
			object3D.position.set(0, 0, 0);
			cameraInfo.position.z = 2.5 * elemento[id].radioAtomico;
			rendererInfo.render(sceneInfo, cameraInfo);
		}

		let largo = document.getElementsByClassName("seccion");
        while (largo[0]) {
            largo[0].parentNode.removeChild(largo[0]);
        }

		let skibidi;
		if(elemento[id].elemento == true){
			skibidi = 13;	
		}else{
			skibidi = 2;	
		}

        for (let cont = 0; cont < titule.length - skibidi; cont++) {
            let seccion = document.createElement("div");
            seccion.setAttribute("class", "seccion");

            let titulo = document.createElement("div");
            titulo.setAttribute("class", "titulo");

            titulo.innerHTML = titule[cont];
            seccion.appendChild(titulo);

            let text = document.createElement("div");
            text.setAttribute("class", "text");

            switch (titule[cont]) {
				case 'tipo':
					let tipoBonito = getTypeName(texte[cont]);
					text.innerHTML = tipoBonito;
                    seccion.appendChild(text);
					break;
					
                case 'componentes':
                    let lista = document.createElement("ul");
                    lista.setAttribute("class", "lista");
                    seccion.appendChild(lista);
					
					if(elemento[id].elemento == true){
						largo = elemento[id].compuestos;
					}else{
						largo = elemento[id].child.componentes
					}
					for (let cont1 = 0; cont1 < largo.length; cont1++) {
                        let objeto = document.createElement("li");
                        let link = document.createElement("a");

                        link.setAttribute("href", "?accion=" + largo[cont1].z)
                        if (largo[cont1].subindice > 1) {
                            link.innerHTML = largo[cont1].nombre + ((largo[cont1].subindice).toString()).sub();
                        } else {
                            link.innerHTML = largo[cont1].nombre;
                        }

                        lista.appendChild(objeto);
                        objeto.appendChild(link);
                    }
                    break;

                case 'nombre':
                    if (elemento[id].elemento == true) {
                        let link = document.createElement("a");
                        link.setAttribute("href", "?accion=" + elemento[id].z);

                        text.appendChild(link);
                        link.innerHTML = texte[cont];
                        seccion.appendChild(text);
                    }else{
						text.innerHTML = texte[cont];
						seccion.appendChild(text);
					}
                    break;

                default:
                    text.innerHTML = texte[cont];
                    seccion.appendChild(text);
                    break;
            }

            document.getElementsByClassName("info")[0].appendChild(seccion);
        }
    }
}

var angle = Math.floor(Math.random() * 360);
let frameInfo = 0;
function animateInfo() {
	if(elemento[idInfo].elemento == true){
		angle = angle + 5;
		let cos = Math.cos(angle * Math.PI / 180);
		let sin = Math.sin(angle * Math.PI / 180);

		object3D.rotation.x = cos;
		object3D.rotation.y = sin;

		if (elemento[idInfo] != undefined) {
			if (elemento[idInfo].oxidacion != 0) {
				let shakeInfo = elemento[idInfo].oxidacion * 25 / 8;
				if (shakeInfo < 0) {
					shakeInfo = shakeInfo * -1;
				}

				if (shakeInfo >= 25) {
					shakeInfo = 25;
				}

				if (Math.random() * 1 > 0.5) {
					object3D.position.x = Math.random() * shakeInfo;
				}
				else {
					object3D.position.x = Math.random() * shakeInfo;
				}

				if (Math.random() * 1 > 0.5) {
					object3D.position.y = Math.random() * shakeInfo;
				}
				else {
					object3D.position.y = Math.random() * shakeInfo;
				}
			}
		}
		rendererInfo.render(sceneInfo, cameraInfo);
	}else if(elemento[idInfo].elemento == false){
		let min = {}, max = {}, promX, promY;
		elemento[idInfo].child.componentes.forEach(item => {
			let obj3D = scene.getObjectById(item.id);

			if(min.x == undefined && max.x == undefined){
				min.x = obj3D.position.x;
				min.y = obj3D.position.y;

				max.x = obj3D.position.x;
				max.y = obj3D.position.y;
			}else{
				if(min.x >= obj3D.position.x){
					min.x = obj3D.position.x - obj3D.geometry.parameters.radius;
				}

				if(min.y >= obj3D.position.y){
					min.y = obj3D.position.y + obj3D.geometry.parameters.radius;
				}

				if(max.x <= obj3D.position.x){
					max.x = obj3D.position.x + obj3D.geometry.parameters.radius;
				}

				if(max.y <= obj3D.position.y){
					max.y = obj3D.position.y - obj3D.geometry.parameters.radius;
				}
			}
		});
		promX = (min.x + max.x) / 2;
		promY = (min.y + max.y) / 2;

		cameraCompound.position.set(promX, promY, 350);

		rendererInfo.render(scene, cameraCompound);
	}
}
setInterval(animateInfo, 40);

function getTypeName(name) {
    for (let cont = 0; cont < nombres.length; cont++) {
        if (nombres[cont][0] == name) {
            return nombres[cont][1];
        }
    }
}

export {info}
