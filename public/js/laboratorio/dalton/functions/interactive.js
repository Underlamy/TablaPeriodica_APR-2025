import * as THREE from '../../../three.module.js';
import { camera, scene, width, height } from '../init.js';
import { eliminar, basura } from './interface.js';
import { info } from '../infoInit.js';
import { Line2 } from '../../../Line2.js';
import { LineMaterial } from '../../../LineMaterial.js';
import { LineGeometry } from '../../../LineGeometry.js';
import {warn} from '../alert.js';

var draggable = new THREE.Object3D;
let dalton = false;
let elemento = [], dummies = [], tiempo = [], oxi = [], relLink = [];
const container = document.getElementById("canvaElemento");

//mouse
const mouseMove = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

let atomSelected = undefined, infoSelected = undefined;
let raycasterX, raycasterY, mouseX, mouseY, mouseDown = false;
let raycasted;

function getWidth() {
    return parseInt(window.getComputedStyle(container).width);
}

function getHeight() {
    return parseInt(window.getComputedStyle(container).height);
}

//mouse functions
function onMouseMove(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;

    mouseMove.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouseMove.y= - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouseMove, camera);
    const clickObject = raycaster.intersectObjects(scene.children);
    raycasted = clickObject[0];

    if (clickObject.length > 0) {
        if (mouseX && mouseY) {
            if (clickObject[0].object.name == "fondo") {
                raycasterX = clickObject[0].point.x;
                raycasterY = clickObject[0].point.y;
            }
            else {
                raycasterX = clickObject[1].point.x;
                raycasterY = clickObject[1].point.y;
            }
        }
    }

    if (mouseDown == true && atomSelected != undefined && clickObject[0] != undefined) {
        scene.getObjectById(atomSelected).position.set(raycasterX, raycasterY, 0);
        elemento[atomSelected].x = raycasterX;
        elemento[atomSelected].y = raycasterY;
        //dummies[atomSelected].position.x = raycasterX;
        //dummies[atomSelected].position.y = raycasterY;

        let wiwi = toScreenPosition(scene.getObjectById(atomSelected), camera);
        document.getElementById(atomSelected).style.left = (wiwi.x - 20) + "px";
        document.getElementById(atomSelected).style.top = (wiwi.y - 20) + "px";
    }
}

window.addEventListener("mousedown", function () {
    mouseDown = true;

    raycaster.setFromCamera(mouseMove, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0 && intersects[0].object.userData.draggable) {
        atomSelected = intersects[0].object.id;
    }

    if (intersects[0].object.userData.electron) {
        var target = new THREE.Vector3();
        intersects[0].object.getWorldPosition(target);

        let positions = [target.x, target.y, 0, raycasterX, raycasterY, 0];

        const lineGeometry = new LineGeometry();
        lineGeometry.setPositions(positions);

        const lineMaterial = new LineMaterial({
            color: 0xffffff,
            linewidth: 5, // Adjust for screen resolution
        });

        lineMaterial.resolution.set(window.innerWidth, window.innerHeight);

        // Create the line and add to the scene
        const line = new Line2(lineGeometry, lineMaterial);
        scene.add(line);

        document.addEventListener('mousemove', link);

        function link() {
            positions = [target.x, target.y, 0, raycasterX, raycasterY, 0]; // Line starts at (0, 0, 0) and ends at mouse
            lineGeometry.setPositions(positions);

            document.addEventListener("mouseup", stopLine);

            function stopLine() {
                document.removeEventListener("mousemove", link);
                document.removeEventListener("mouseup", stopLine);

                if (raycasted.object.userData.electron && raycasted.object != line.parent) {
                    positions = [target.x, target.y, 0, raycasterX, raycasterY, 0]; // Line starts at (0, 0, 0) and ends at mouse
                    lineGeometry.setPositions(positions);

                    relLink[line.id] = {
                        'dad': intersects[0].object,
                        'mom': raycasted.object,
                        'child': line
                    };
                } else {
                    scene.remove(line);
                }
            }
        }
    }

    container.style.zIndex = 1;
});

window.addEventListener("mouseup", function (event) {
    mouseDown = false;

    if (atomSelected) {
        eliminar(event);
        basura(event);

        atomSelected = undefined;
    }

    container.style.zIndex = -1;
});

window.addEventListener("contextmenu", (event) => {
    event.preventDefault();

    raycaster.setFromCamera(mouseMove, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0 && intersects[0].object.userData.draggable) {
        document.getElementsByClassName("objectInfo")[0].style.opacity = "100%";
        infoSelected = intersects[0].object.id;

        let titule = [];
        let texte = [];
        for (const [key, value] of Object.entries(elemento[infoSelected])) {
            titule = titule.concat(`${key}`);
            texte = texte.concat(`${value}`);
        }

        info(infoSelected, titule, texte);
    }
});

function radioAtomico(periodo, grupo) {
    let radio;

    radio = (20 * periodo) * (((grupo - 18) * -1) / 10);
    if (radio < 51) {
        radio = 50;
    }

    return radio;
}

function descomponer(id) {
    scene.remove(scene.getObjectById(id));
    document.getElementById(id).remove();
    elemento[id] = undefined;

    tiempo[atomSelected] = undefined;
    oxi[atomSelected] = undefined;

    atomSelected = undefined;
}

function vida() {
    for (let cont = 0; cont < tiempo.length; cont++) {
        tiempo[cont] = tiempo[cont] - 1;
        if (tiempo[cont] <= 0) {
            try {
                for (let cont1 = 0; cont1 < elemento[cont].componentes.length; cont1++) {
                    let element = elemento[cont].componentes[cont1];
                    element.subindice = 1;
                    spawn(document.getElementById(element.simbolo + "-" + element.oxidacion), element, elemento[cont]);
                }

                warn("info", "compuesto " + document.getElementById(cont).innerHTML + " se ha desestabilizado");

                scene.remove(scene.getObjectById(cont));
                document.getElementById(cont).remove();
                elemento[cont] = undefined;
            } catch (err) {
                console.log(err);
                console.log(cont);
                console.log(tiempo);
                console.log(elemento);
            }
            tiempo[cont] = undefined;
        }
    }
}

function gravedad() {
    for (let cont = 0; cont < elemento.length; cont++) {
        if (document.getElementById(cont) != undefined && atomSelected != cont) {
            let wawa = elemento[cont].oxidacion;
            if (wawa <= -1) {
                wawa = wawa * -1;
            }

            oxi[cont] = {
                "oxidacion": 0,
                "x": 0,
                "y": 0
            };

            for (let cont1 = 0; cont1 < elemento.length; cont1++) {
                if (document.getElementById(cont1) != undefined && cont != cont1 && atomSelected != cont1) {
                    let wewe = elemento[cont1].oxidacion;
                    if (wewe <= -1) {
                        wewe = wewe * -1;
                    }

                    if (elemento[cont].x - (wawa * 50) <= elemento[cont1].x + (wewe * 50)
                        && elemento[cont].x + (wawa * 50) >= elemento[cont1].x - (wewe * 50)
                        && elemento[cont].y - (wawa * 50) <= elemento[cont1].y + (wewe * 50)
                        && elemento[cont].y + (wawa * 50) >= elemento[cont1].y - (wewe * 50)) {

                        if (elemento[cont].oxidacion >= 1) {
                            if (elemento[cont1].oxidacion >= 1) {
                                oxi[cont].oxidacion += parseInt(elemento[cont1].oxidacion);
                                oxi[cont].x += elemento[cont].x - elemento[cont1].x;
                                oxi[cont].y += elemento[cont].y - elemento[cont1].y;
                            }
                        } else if (elemento[cont].oxidacion <= -1) {
                            if (elemento[cont1].oxidacion <= -1) {
                                oxi[cont].oxidacion += -1 * (parseInt(elemento[cont1].oxidacion));
                                oxi[cont].x += elemento[cont].x - elemento[cont1].x;
                                oxi[cont].y += elemento[cont].y - elemento[cont1].y;
                            } else if (elemento[cont1].oxidacion >= 1) {
                                oxi[cont].oxidacion += oxi[cont].oxidacion + (-1 * (parseInt(elemento[cont1].oxidacion)));
                                oxi[cont].x += elemento[cont].x - elemento[cont1].x;
                                oxi[cont].y += elemento[cont].y - elemento[cont1].y;
                            }
                        }
                    }
                }
            }
        }
    }

    for (let cont = 0; cont < oxi.length; cont++) {
        if (oxi[cont] != undefined && scene.getObjectById(cont) != undefined) {
            if (scene.getObjectById(cont).position.x + (elemento[cont].radioAtomico * 2) <= (width / 2) * 0.65 && scene.getObjectById(cont).position.x - (elemento[cont].radioAtomico * 1.75) >= -(width / 2)
                && scene.getObjectById(cont).position.y + (elemento[cont].radioAtomico * 1.75) <= height / 2 && scene.getObjectById(cont).position.y - (elemento[cont].radioAtomico * 1.75) >= -(height / 2)) {

                if (oxi[cont].oxidacion >= 1) {
                    let a = oxi[cont].x;
                    let b = oxi[cont].y;
                    let c = Math.sqrt((a * a) + (b * b));
                    let beta = b / c;
                    let alfa = a / c;
                    b = beta * oxi[cont].oxidacion;
                    a = alfa * oxi[cont].oxidacion;

                    scene.getObjectById(cont).position.set(scene.getObjectById(cont).position.x + a, scene.getObjectById(cont).position.y + b, 0);
                    elemento[cont].x = elemento[cont].x + a;
                    elemento[cont].y = elemento[cont].y + b;
                } else if (oxi[cont].oxidacion <= -1) {
                    let a = -oxi[cont].x;
                    let b = -oxi[cont].y;
                    let c = Math.sqrt((a * a) + (b * b));
                    let beta = b / c;
                    let alfa = a / c;
                    b = beta * oxi[cont].oxidacion;
                    a = alfa * oxi[cont].oxidacion;

                    scene.getObjectById(cont).position.set(scene.getObjectById(cont).position.x - a, scene.getObjectById(cont).position.y - b, 0);
                    elemento[cont].x = elemento[cont].x - a;
                    elemento[cont].y = elemento[cont].y - b;
                }
            }
        }
    }
}

//Init Atom
function getColor(HTMLtarget) {
    for (let cont = 0; cont < colores.length; cont++) {
        if (colores[cont][0] == HTMLtarget.getAttribute("data-tipo")) {
            return colores[cont][1];
        }
    }
}

function createNucleus(color, radius) {
    const geometry = new THREE.IcosahedronGeometry(radius, 0);
    const material = new THREE.MeshToonMaterial({ color: color });
    let nucleus = new THREE.Mesh(geometry, material);
    nucleus.name = "nucleo";
    nucleus.userData.draggable = true;
    scene.add(nucleus);

    return nucleus;
}

//Para crear elementos HTML que sigan a un objeto de THREE JS
function attachableHTML(obj3D, text) {
    let attachable = document.createElement("div");
    document.getElementsByTagName("body")[0].appendChild(attachable);
    attachable.setAttribute("id", obj3D.id);
    attachable.innerHTML = text;

    return attachable;
}

function infoObj(HTMLtarget, obj3D) {
    this.simbolo = HTMLtarget.getAttribute("data-simbolo");
    this.nombre = HTMLtarget.getAttribute("data-nombre");
	this.tipo = HTMLtarget.getAttribute("data-tipo");
    this.oxidacion = HTMLtarget.getAttribute("data-superindice");  
	this.z = HTMLtarget.getAttribute("data-numatomico"); 
	this.periodo = HTMLtarget.getAttribute("data-periodo");
    this.grupo = HTMLtarget.getAttribute("data-grupo");
    this.radioAtomico = radioAtomico(HTMLtarget.getAttribute("data-periodo"), HTMLtarget.getAttribute("data-grupo"));
    this.configE = new elementoConfigE(HTMLtarget.getAttribute("data-numatomico"), HTMLtarget.getAttribute("data-superindice"));
    this.id = atomSelected;
    this.subindice = 1;
    this.elemento = true;
    this.x = obj3D.position.x;
    this.y = obj3D.position.y;
    this.angle = Math.floor(Math.random() * 360);
    this.rgb = [obj3D.material.color.r, obj3D.material.color.g, obj3D.material.color.b];
}

function createElectrons(nucleus, numElectrons){
    dummies[nucleus.id] = new THREE.Mesh();
    dummies[nucleus.id].position.x = elemento[atomSelected].x;
    dummies[nucleus.id].position.y = elemento[atomSelected].y;
    scene.add(dummies[atomSelected]);

    const geometryElectron = new THREE.IcosahedronGeometry(20, 0);
    const materialElectron = new THREE.MeshToonMaterial({ color: 0xEEEEEE });
    const angle = 360 / numElectrons;

    for (let cont = 0; cont <= numElectrons; cont++) {
        let rotation = (angle * cont);
        let electron = new THREE.Mesh(geometryElectron, materialElectron);
        dummies[nucleus.id].add(electron);

        electron.userData.electron = true;
        electron.position.set((Math.cos(rotation * 0.017453292519943295) * 100), (Math.sin(rotation * 0.017453292519943295) * 100), 0);
    }
}
//End Init Atom

//functions
export function crearAtomo(event) {
    container.style.zIndex = 1;
    let selected = event.target;

    let nucleo = createNucleus(getColor(selected), radioAtomico(selected.getAttribute("data-periodo"), selected.getAttribute("data-grupo")));
    atomSelected = nucleo.id;
    nucleo.position.set(raycasterX, raycasterY, 0);

    const nombre = attachableHTML(nucleo, selected.getAttribute("data-simbolo") + "<sup>" + selected.getAttribute("data-superindice") + "</sup>");
    nombre.setAttribute("class", "nombre3D");

    elemento[atomSelected] = new infoObj(selected, nucleo);
    //console.log(elemento[atomSelected].configE.lewis);
    //console.log(elemento[atomSelected].configE.valencia);

    //createElectrons(nucleo, elemento[atomSelected].configE.valencia);

    if (elemento[atomSelected].simbolo == null) {
        console.error("objeto " + atomSelected + " corrputo");
        descomponer(atomSelected);
    }
}
window.crearAtomo = crearAtomo;

function spawn(target, child, parent) {
    let colorNucleo;

    for (let cont = 0; cont < colores.length; cont++) {
        if (colores[cont][0] == target.getAttribute("data-tipo")) {
            colorNucleo = colores[cont][1];
        }
    }

    const geometry = new THREE.IcosahedronGeometry(radioAtomico(target.getAttribute("data-periodo"), target.getAttribute("data-grupo")), 0);
    const material = new THREE.MeshToonMaterial({ color: colorNucleo });
    let nucleo = new THREE.Mesh(geometry, material);
    nucleo.position.set(parent.x, parent.y, 0);
    nucleo.userData.draggable = true;
    scene.add(nucleo);

    elemento[nucleo.id] = child;

    if (Math.random() <= 0.5) {
        scene.getObjectById(nucleo.id).position.x += (Math.random() * parent.radioAtomico * 2);
        elemento[nucleo.id].x = scene.getObjectById(nucleo.id).position.x;
    } else {
        scene.getObjectById(nucleo.id).position.x -= (Math.random() * parent.radioAtomico * 2);
        elemento[nucleo.id].x = scene.getObjectById(nucleo.id).position.x;
    }

    if (Math.random() * 1 <= 0.5) {
        scene.getObjectById(nucleo.id).position.y += (Math.random() * parent.radioAtomico * 2);
        elemento[nucleo.id].y = scene.getObjectById(nucleo.id).position.y;
    } else {
        scene.getObjectById(nucleo.id).position.y -= (Math.random() * parent.radioAtomico * 2);
        elemento[nucleo.id].y = scene.getObjectById(nucleo.id).position.y;
    }

    let nombre = document.createElement("div");
    document.getElementsByTagName("body")[0].appendChild(nombre);
    nombre.setAttribute("id", nucleo.id);
    nombre.setAttribute("class", "nombre3D");
    nombre.innerHTML = target.getAttribute("data-simbolo") + "<sup>" + target.getAttribute("data-superindice") + "</sup>";
}

function fusionar(parentID, childID) {
    let parent = scene.getObjectById(parentID);
    let child = scene.getObjectById(childID);

    if (parent != undefined && child != undefined) {
        let parentX = parent.position.x;
        let parentY = parent.position.y;

        let childX = child.position.x;
        let childY = child.position.y;
        let childAncho = (elemento[parentID].radioAtomico * 2) * .85;

        if (parentX >= (childX - childAncho) && parentX <= (childX + childAncho)
            && parentY >= (childY - childAncho) && parentY <= (childY + childAncho)) {

            let nucleo = createNucleus("rgb(" + Math.floor(((elemento[parentID].rgb[0] + elemento[childID].rgb[0]) / 2) * 255) + ", " + Math.floor(((elemento[parentID].rgb[1] + elemento[childID].rgb[1]) / 2) * 255) + ", " + Math.floor(((elemento[parentID].rgb[2] + elemento[childID].rgb[2]) / 2) * 255) + ")", (elemento[childID].radioAtomico + elemento[parentID].radioAtomico) / 1.5);
            nucleo.position.set((childX + parentX) / 2, (childY + parentY) / 2, 0);

            let compuesto = [], componente = [];

            if (elemento[parentID].elemento == true) {
                compuesto = compuesto.concat(elemento[parentID]);
                componente = componente.concat(elemento[parentID]);
            } else {
                for (let cont = 0; cont < elemento[parentID].compuestos.length; cont++) {
                    compuesto = compuesto.concat(elemento[parentID].compuestos[cont]);
                }

                for (let cont = 0; cont < elemento[parentID].componentes.length; cont++) {
                    componente = componente.concat(elemento[parentID].componentes[cont]);
                }
            }

            if (elemento[childID].elemento == true) {
                compuesto = compuesto.concat(elemento[childID]);
                componente = componente.concat(elemento[childID]);
            } else {
                for (let cont = 0; cont < elemento[childID].compuestos.length; cont++) {
                    compuesto = compuesto.concat(elemento[childID].compuestos[cont]);
                }

                for (let cont = 0; cont < elemento[childID].componentes.length; cont++) {
                    componente = componente.concat(elemento[childID].componentes[cont]);
                }
            }

            let oxidacion = 0;
            for (let cont = 0; cont < componente.length; cont++) {
                oxidacion += parseInt(componente[cont].oxidacion);
            }

            let newSimbolo = newCompound(parent, child, nucleo);

            let nombre = document.createElement("div");
            document.getElementsByTagName("body")[0].appendChild(nombre);
            nombre.setAttribute("id", nucleo.id);
            nombre.setAttribute("class", "nombre3D");
            nombre.innerHTML = newSimbolo.simbolo;

            elemento[nucleo.id] = {
                "simbolo": newSimbolo.simbolo,
                "nombre": newSimbolo.nombre,
				"tipo": newSimbolo.tipo,
                "componentes": componente,
                "oxidacion": oxidacion,
                "radioAtomico": Math.floor((elemento[childID].radioAtomico + elemento[parentID].radioAtomico) / 1.5),
                "compuestos": compuesto,
                "elemento": false,
                "id": nucleo.id,
                "x": (childX + parentX) / 2,
                "y": (childY + parentY) / 2,
                "angle": Math.floor(Math.random() * 360),
                "rgb": [nucleo.material.color.r, nucleo.material.color.g, nucleo.material.color.b]
            }

            scene.remove(scene.getObjectById(childID));
            scene.remove(scene.getObjectById(parentID));

            document.getElementById(childID).remove();
            document.getElementById(parentID).remove();

            tiempo[childID] = undefined;
            oxi[childID] = undefined;

            tiempo[parentID] = undefined;
            oxi[parentID] = undefined;

            elemento[childID] = undefined;
            elemento[parentID] = undefined

            if (oxidacion > 0) {
                tiempo[nucleo.id] = Math.floor(100 / oxidacion);
            } else if (oxidacion < 0) {
                tiempo[nucleo.id] = Math.floor(100 / (-1 * oxidacion));
            }

            if (document.getElementById("info" + childID)) {
                document.getElementById("info" + childID).style.opacity = 0;
                info(undefined, undefined, undefined);
            }

            if (document.getElementById("info" + parentID)) {
                document.getElementById("info" + parentID).style.opacity = 0;
                info(undefined, undefined, undefined);
            }
        }
    }
}

function newCompound(obj1, obj2, child) {
    let infoObj1 = elemento[obj1.id];
    let infoObj2 = elemento[obj2.id];

    let type;
    let nombre, simbolo; 

    let metales = ["metalesAlcalinos", "alcalinoTerreos", "metalesTransicion", 
                    "otrosMetales", "metaloides", "lantanidos", "actinidos"];

    let noMetales = ["noMetales", "halogenos"];
	let noMetalesElec = ["F", "Cl", "Br", "I", "O", "S", "Se"];
	let noMetalesNoElec = ["N", "P", "As", "Sb"];

	if (infoObj1.elemento == true && infoObj2.elemento == true) {
		let numOxidacion = parseInt(infoObj1.oxidacion) + parseInt(infoObj2.oxidacion);

		if(infoObj1.simbolo == infoObj2.simbolo){
			nombre = infoObj1.nombre;
			simbolo = infoObj1.simbolo;
			child.material.color.set(getTypeColor(infoObj1.tipo));
			
			return {
				nombre: nombre, 
				simbolo: "(" + simbolo + "<sub>2</sub>) <sup>" + numOxidacion + "</sup>",
				tipo: infoObj1.tipo
			};
		}

        if (infoObj1.simbolo === "H" || infoObj2.simbolo === "H") {
            let elemento = infoObj1.simbolo === "H" ? infoObj2 : infoObj1;
            
            if (noMetales.includes(elemento.tipo) && noMetalesElec.includes(elemento.simbolo)) {
                type = "hidracidos";
                child.material.color.set(getTypeColor(type));
                nombre = elemento.nombre + "uro de hidrogeno";
				simbolo = "H" + elemento.simbolo;
			}else if(noMetales.includes(elemento.tipo) && 
					noMetalesNoElec.includes(elemento.simbolo)){

				type = "hidrurosNoMetalicos";
				child.material.color.set(getTypeColor(type));
				nombre = "Hidruro de " + elemento.nombre + numRomanos(elemento.oxidacion);
				simbolo = "H" + elemento.simbolo;
            } else if (metales.includes(elemento.tipo)) {
                type = "hidrurosMetalicos";
                if (infoObj1.simbolo === "H"){
					nombre = "Hidruro de " + elemento.nombre + numRomanos(elemento.oxidacion);
					simbolo = elemento.simbolo + "H";
					child.material.color.set(getTypeColor(type));
				}
            }
            simbolo = "H" + elemento.simbolo;

			return {
				nombre: nombre, 
				simbolo: "(" + simbolo + ") <sup>" + numOxidacion + "</sup>",
				tipo: type
			};
        }

        if (infoObj1.simbolo === "O" || infoObj2.simbolo === "O") {
            let elemento = infoObj1.simbolo === "O" ? infoObj2 : infoObj1;
            
            if (noMetales.includes(elemento.tipo)) {
                type = "oxidosNoMetalicos";
                child.material.color.set(getTypeColor(type));
                nombre = "Oxido de " + elemento.nombre + numRomanos(elemento.oxidacion);
            } else if (metales.includes(elemento.tipo)) {
                type = "oxidosMetalicos";
				child.material.color.set(getTypeColor(type));
                if (infoObj1.simbolo === "O") nombre = "Oxido de " + elemento.nombre + 
					numRomanos(elemento.oxidacion);
            }
            simbolo = elemento.simbolo + "O";

			return {
				nombre: nombre, 
				simbolo: "(" + simbolo + ") <sup>" + numOxidacion + "</sup>",
				tipo: type
			};
        }   

		if (noMetales.includes(infoObj1.tipo) && metales.includes(infoObj2.tipo)) {
			var noMetal = infoObj1;
			var metal = infoObj2;

			type = "salesBinarias";
			child.material.color.set(getTypeColor(type));
			nombre = noMetal.nombre + "uro de " + metal.nombre + numRomanos(metal.oxidacion);
			simbolo = metal.simbolo + noMetal.simbolo; 

			return {
				nombre: nombre, 
				simbolo: "(" + simbolo + ") <sup>" + numOxidacion + "</sup>",
				tipo: type
			};
		} else if (noMetales.includes(infoObj2.tipo) && metales.includes(infoObj1.tipo)) {
			var noMetal = infoObj2;
			var metal = infoObj1;

			type = "salesBinarias";
			child.material.color.set(getTypeColor(type));
			nombre = noMetal.nombre + "uro de " + metal.nombre + numRomanos(metal.oxidacion);
			simbolo = metal.simbolo + noMetal.simbolo; 

			return {
				nombre: nombre, 
				simbolo: "(" + simbolo + ") <sup>" + numOxidacion + "</sup>",
				tipo: type
			};

		}

		if(metales.includes(infoObj1.tipo) && metales.includes(infoObj2.tipo)){
			type = "aleacion";
			child.material.color.set(getTypeColor(type));

            return {
				nombre: "aleacion de " + infoObj1.nombre + " y " + infoObj2.nombre, 
				simbolo: "(" + infoObj1.simbolo + infoObj2.simbolo + ") <sup>" + numOxidacion + "</sup>",
				tipo: type
			};
		}
    }else{
		let objs = [];

		if(infoObj1.elemento == true){
			objs.push(infoObj1);
		}else{
			infoObj1.componentes.forEach(obj => {
				objs.push(obj);
			});
		}

		if(infoObj2.elemento == true){
			objs.push(infoObj2);
		}else{
			infoObj2.componentes.forEach(obj => {
				objs.push(obj);
			});
		}
		
		let numOxidacion = 0, simbolo = "";
		objs.forEach(obj => {
			numOxidacion += parseInt(obj.oxidacion);
			simbolo += obj.simbolo;
		});

		child.material.color.set(getTypeColor("desconocido"));

		return {
				nombre: "composición indeterminada",
				simbolo: "(" + simbolo + ") <sup>" + numOxidacion + "</sup>",
				tipo: "desconocido"
		}
	}
}

function nivelesEnergeticos(electrones, p) {
    let nivelE = ["1s", "2s", "2p", "3s", "3p", "4s", "3d", "4p", "5s", "4d", "5p", "6s", "4f", "5d", "6p", "7s", "5f", "6d", "7p", "6f", "7d", "7f"];
    let periodos = [0, 0, 0, 0, 0, 0, 0, 0];
    let electonesTotal = 0;

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

function elementoConfigE(electrones, oxidacion) {
    this.total = electrones;
    this.periodo = function (p) {
        let nivelE = ["1s", "2s", "2p", "3s", "3p", "4s", "3d", "4p", "5s", "4d", "5p", "6s", "4f", "5d", "6p", "7s", "5f", "6d", "7p", "6f", "7d", "7f"];
        let periodos = [0, 0, 0, 0, 0, 0, 0, 0];
        let electonesTotal = 0;

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
    };

    let valencia = 1;
    for (let cont = 7; cont > 0; cont--) {
        if (this.periodo(cont) != 0) {
            valencia = this.periodo(cont);
            cont = 0;
        }
    }
    this.valencia = valencia;
    //debugger;
    let lewis = [];
    oxidacion = parseInt(oxidacion);
    if (oxidacion < 0) {
        oxidacion = oxidacion * -1;
    }
    let cont = (valencia - oxidacion) / 2;
    for (cont; cont >= 1; cont--) {
        lewis.push([true, true]);
    }
    for (oxidacion; oxidacion >= 1; oxidacion--) {
        lewis.push([true]);
    }
    this.lewis = lewis;
}

function toScreenPosition(obj, camera) {
    var vector = new THREE.Vector3();

    var widthHalf = 0.5 * parseInt(container.style.width);
    var heightHalf = 0.5 * parseInt(container.style.height);

    obj.updateMatrixWorld();
    vector.setFromMatrixPosition(obj.matrixWorld);
    vector.project(camera);

    vector.x = (vector.x * widthHalf) + widthHalf;
    vector.y = - (vector.y * heightHalf) + heightHalf;

    return {
        x: vector.x,
        y: vector.y
    };
}

function getTypeColor(name) {
    for (let cont = 0; cont < colores.length; cont++) {
        if (colores[cont][0] == name) {
            return colores[cont][1];
        }
    }
}

function getTypeName(name) {
    for (let cont = 0; cont < nombres.length; cont++) {
        if (nombres[cont][0] == name) {
            return nombres[cont][1];
        }
    }
}

export { gravedad, vida, onMouseMove, elemento, atomSelected, toScreenPosition, fusionar, tiempo, oxi, descomponer }
