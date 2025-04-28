import * as THREE from '../../../three.module.js';
import { camera, scene, width, height } from '../init.js';
import { eliminar, basura } from './interface.js';
import { info } from '../infoInit.js';
import { Line2 } from '../../../Line2.js';
import { LineMaterial } from '../../../LineMaterial.js';
import { LineGeometry } from '../../../LineGeometry.js';
import { warn } from '../alert.js';

let elemento = [], dummies = [], molDummies = [], tiempo = [], oxi = [], relLink = [],
	attractions = [], compound = [];
const container = document.getElementById("canvaElemento");

//mouse
const mouseMove = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

let atomSelected = undefined, infoSelected = undefined;
let raycasterX, raycasterY, mouseX, mouseY, mouseDown = false;
let raycasted, follow;

function getWidth() {
    return parseInt(window.getComputedStyle(container).width);
}

function getHeight() {
    return parseInt(window.getComputedStyle(container).height);
}

const objUpdate = [];
function objAnimationUpdate(object, behavior) {
    object.userData.animationUpdate = behavior;
    objUpdate.push(object);
}

//mouse functions
function onMouseMove(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;

    mouseMove.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouseMove.y = - (event.clientY / window.innerHeight) * 2 + 1;

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
        dummies[atomSelected].position.x = raycasterX;
        dummies[atomSelected].position.y = raycasterY;

        let wiwi = toScreenPosition(scene.getObjectById(atomSelected), camera);
        document.getElementById(atomSelected).style.left = (wiwi.x - 20) + "px";
        document.getElementById(atomSelected).style.top = (wiwi.y - 20) + "px";
    }
}


let stopLineRegistered = false;
window.addEventListener("mousedown", function (event) {
    event.preventDefault();
    mouseDown = true;

    raycaster.setFromCamera(mouseMove, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    const firstObj = intersects[0].object;

    if (intersects.length > 0 && firstObj.userData.draggable) {
        atomSelected = firstObj.id;
    }

    if (firstObj.userData.electron && firstObj.userData.pair == undefined && firstObj.userData.child == undefined) {
        follow = firstObj;
        var target = new THREE.Vector3();
        firstObj.getWorldPosition(target);

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

        const update = setInterval(link, 40);

        function link() {
            firstObj.getWorldPosition(target);

            positions = [target.x, target.y, 0, raycasterX, raycasterY, 0];
            lineGeometry.setPositions(positions);
            firstObj.parent.userData.rotate = false;

            relLink[firstObj.id] = {
                'dad': firstObj,
                'mom': undefined,
                'child': line
            };
			
			if(!stopLineRegistered){
				document.addEventListener("mouseup", stopLine);
				stopLineRegistered = true;
			}

            function stopLine() {
				stopLineRegistered = false;	
                clearInterval(update);
                document.removeEventListener("mouseup", stopLine);

                firstObj.parent.userData.rotate = true;
                if (raycasted.object.userData.electron && raycasted.object != line.parent &&
                    raycasted.object.userData.pair == undefined && raycasted.object.parent != firstObj.parent) {
                    let compoundInfo = newCompound(firstObj.parent.userData.parent, raycasted.object.parent.userData.parent);

					let compuesto = new infoObjCompound(compoundInfo);
					compound.push(compuesto);
					console.log(compoundInfo);
					elemento[firstObj.parent.userData.parent.id].child = compuesto;
					elemento[raycasted.object.parent.userData.parent.id].child = compuesto;

					compuesto.dad = elemento[firstObj.parent.userData.parent.id];
					compuesto.mom = elemento[raycasted.object.parent.userData.parent.id];
					
                    line.userData.dad = firstObj;
                    line.userData.mom = raycasted.object;

                    attractions.push({
                        nucleo1: firstObj.parent.userData.parent,
                        nucleo2: raycasted.object.parent.userData.parent,
                        electron1: firstObj,
                        electron2: raycasted.object,
						enlace: line
                    });

                    firstObj.userData.child = line;
                    raycasted.object.userData.child = line;

                    positions = [target.x, target.y, 0, raycasterX, raycasterY, 0];
                    lineGeometry.setPositions(positions);

                    relLink[firstObj.id].mom = raycasted.object;
                    objAnimationUpdate(relLink[firstObj.id].dad, () => {
                        positions = [relLink[firstObj.id].dad.getWorldPosition(new THREE.Vector3()).x, relLink[firstObj.id].dad.getWorldPosition(new THREE.Vector3()).y, 0,
                        relLink[firstObj.id].mom.getWorldPosition(new THREE.Vector3()).x, relLink[firstObj.id].mom.getWorldPosition(new THREE.Vector3()).y, 0];
                        lineGeometry.setPositions(positions);
                    });

                    objAnimationUpdate(relLink[firstObj.id].mom, () => {
                        positions = [relLink[firstObj.id].dad.getWorldPosition(new THREE.Vector3()).x, relLink[firstObj.id].dad.getWorldPosition(new THREE.Vector3()).y, 0,
                        relLink[firstObj.id].mom.getWorldPosition(new THREE.Vector3()).x, relLink[firstObj.id].mom.getWorldPosition(new THREE.Vector3()).y, 0];
                        lineGeometry.setPositions(positions);
                    });

                } else {
                    scene.remove(line);
                }
            }
        }
    }

    container.style.zIndex = 1;
});

function infoObjCompound(obj) {
    this.simbolo = obj.simbolo;
    this.nombre = obj.nombre;
	this.tipo = obj.tipo;
	this.componentes = obj.componentes;
}


function newCompound(obj1, obj2) {
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
		infoObj1.elemento = false;
		infoObj2.elemento = false;
		let componentes = [infoObj1, infoObj2];
		let numOxidacion = parseInt(infoObj1.oxidacion) + parseInt(infoObj2.oxidacion);

		if(infoObj1.simbolo == infoObj2.simbolo){
			nombre = infoObj1.nombre;
			simbolo = infoObj1.simbolo;
			obj1.material.color.set(getTypeColor(infoObj1.tipo));
			obj2.material.color.set(getTypeColor(infoObj1.tipo));
			
			return {
				nombre: nombre, 
				simbolo: "(" + simbolo + "<sub>2</sub>) <sup>" + numOxidacion + "</sup>",
				tipo: infoObj1.tipo,
				componentes: componentes
			};
		}

        if (infoObj1.simbolo === "H" || infoObj2.simbolo === "H") {
			let elemento;
            if (infoObj1.simbolo !== "H") {
				let temp = infoObj1;
				infoObj1 = infoObj2;
				infoObj2 = temp;
			}
			elemento = infoObj2;
            
            if (noMetales.includes(elemento.tipo) && noMetalesElec.includes(elemento.simbolo)) {
				infoObj1.tipo = "hidracidos";
				infoObj2.tipo = "hidracidos";
				type = "hidracidos";	

                obj1.material.color.set(getTypeColor(type));
				obj2.material.color.set(getTypeColor(type));

                nombre = elemento.nombre + "uro de hidrogeno";
				simbolo = "H" + elemento.simbolo;
			}else if(noMetales.includes(elemento.tipo) && 
					noMetalesNoElec.includes(elemento.simbolo)){

				infoObj1.tipo = "hidrurosNoMetalicos";
				infoObj2.tipo = "hidrurosNoMetalicos";
				type = "hidrurosNoMetalicos";
				obj1.material.color.set(getTypeColor(infoObj1.tipo));
				obj2.material.color.set(getTypeColor(infoObj1.tipo));
				nombre = "Hidruro de " + elemento.nombre + numRomanos(elemento.oxidacion);
				simbolo = "H" + elemento.simbolo;
            } else if (metales.includes(elemento.tipo)) {
                infoObj1.tipo = "hidrurosMetalicos";
				infoObj2.tipo = "hidrurosMetalicos";
				type = "hidrurosMetalicos";

                if (infoObj1.simbolo === "H"){
					nombre = "Hidruro de " + elemento.nombre + numRomanos(elemento.oxidacion);
					simbolo = elemento.simbolo + "H";
					obj1.material.color.set(getTypeColor(type));
					obj2.material.color.set(getTypeColor(type));
				}
            }
            simbolo = "H" + elemento.simbolo;

			return {
				nombre: nombre, 
				simbolo: "(" + simbolo + ") <sup>" + numOxidacion + "</sup>",
				tipo: type,
				componentes: componentes
			};
        }

        if (infoObj1.simbolo === "O" || infoObj2.simbolo === "O") {
            let elemento;
            if (infoObj1.simbolo !== "O") {
				let temp = infoObj1;
				infoObj1 = infoObj2;
				infoObj2 = temp;
			}
			elemento = infoObj2;
            
            if (noMetales.includes(elemento.tipo)) {
                infoObj1.tipo = "oxidosNoMetalicos";
				infoObj2.tipo = "oxidosNoMetalicos";
				type = "oxidosNoMetalicos";
                obj1.material.color.set(getTypeColor(type));
				obj2.material.color.set(getTypeColor(type));
                nombre = "Oxido de " + elemento.nombre + numRomanos(elemento.oxidacion);
            } else if (metales.includes(elemento.tipo)) {
                infoObj1.tipo = "oxidosMetalicos";
				infoObj2.tipo = "oxidosMetalicos";
				type = "oxidosMetalicos";
				obj1.material.color.set(getTypeColor(type));
				obj2.material.color.set(getTypeColor(type));
                if (infoObj1.simbolo === "O") nombre = "Oxido de " + elemento.nombre + 
					numRomanos(elemento.oxidacion);
            }
            simbolo = elemento.simbolo + "O";

			return {
				nombre: nombre, 
				simbolo: "(" + simbolo + ") <sup>" + numOxidacion + "</sup>",
				tipo: type,
				componentes: componentes
			};
        }   

		if (noMetales.includes(infoObj1.tipo) && metales.includes(infoObj2.tipo)) {
			var noMetal = infoObj1;
			var metal = infoObj2;

			infoObj1.tipo = "salesBinarias";
			infoObj2.tipo = "salesBinarias";
			type = "salesBinarias";
			obj1.material.color.set(getTypeColor(type));
			obj2.material.color.set(getTypeColor(type));
			nombre = noMetal.nombre + "uro de " + metal.nombre + numRomanos(metal.oxidacion);
			simbolo = metal.simbolo + noMetal.simbolo; 

			return {
				nombre: nombre, 
				simbolo: "(" + simbolo + ") <sup>" + numOxidacion + "</sup>",
				tipo: type,
				componentes: componentes
			};
		} else if (noMetales.includes(infoObj2.tipo) && metales.includes(infoObj1.tipo)) {
			var noMetal = infoObj2;
			var metal = infoObj1;

			infoObj1.tipo = "salesBinarias";
			infoObj2.tipo = "salesBinarias";
			type = "salesBinarias";
			obj1.material.color.set(getTypeColor(type));
				obj2.material.color.set(getTypeColor(type));
			nombre = noMetal.nombre + "uro de " + metal.nombre + numRomanos(metal.oxidacion);
			simbolo = metal.simbolo + noMetal.simbolo; 

			return {
				nombre: nombre, 
				simbolo: "(" + simbolo + ") <sup>" + numOxidacion + "</sup>",
				tipo: type
			};

		}

		if(metales.includes(infoObj1.tipo) && metales.includes(infoObj2.tipo)){
			infoObj1.tipo = "aleacion";
			infoObj2.tipo = "aleacion";
			type = "aleacion";
			obj1.material.color.set(getTypeColor(type));
			obj2.material.color.set(getTypeColor(type));

            return {
				nombre: "aleacion de " + infoObj1.nombre + " y " + infoObj2.nombre, 
				simbolo: "(" + infoObj1.simbolo + infoObj2.simbolo + ") <sup>" + numOxidacion + "</sup>",
				tipo: type,
				componentes: componentes
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

		obj1.material.color.set(getTypeColor("desconocido"));
		obj2.material.color.set(getTypeColor("desconocido"));

		return {
				nombre: "composición indeterminada",
				simbolo: "(" + simbolo + ") <sup>" + numOxidacion + "</sup>",
				tipo: "desconocido"
		}
	}
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
        if(elemento[infoSelected].elemento){
            for (const [key, value] of Object.entries(elemento[infoSelected])) {
                titule = titule.concat(`${key}`);
                texte = texte.concat(`${value}`);
            }
        }else{
            for(const [key, value] of Object.entries(elemento[infoSelected].child)){
                titule = titule.concat(`${key}`);
                texte = texte.concat(`${value}`);
            }
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
    this.oxidacion = 0;
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

function createElectrons(nucleus, numElectrons) {
    dummies[nucleus.id] = new THREE.Mesh();
    dummies[nucleus.id].position.x = elemento[atomSelected].x;
    dummies[nucleus.id].position.y = elemento[atomSelected].y;
    dummies[nucleus.id].userData.rotate = true;
    dummies[nucleus.id].userData.parent = nucleus;
    dummies[nucleus.id].name = "dummy";
    scene.add(dummies[atomSelected]);

    const posElectrons = [[false, false], [false, false], [false, false], [false, false]];
    for (let cont = 0; cont < numElectrons; cont++) {
        if (cont <= 3) {
            posElectrons[cont][0] = true;
        } else {
            posElectrons[cont - 4][1] = true;
        }
    }

    const geometryElectron = new THREE.IcosahedronGeometry(20, 0);
    const materialElectron = new THREE.MeshToonMaterial({ color: 0xEEEEEE });
    const angle = [0, 180, 90, 270];
    let radio = elemento[atomSelected].radioAtomico + 50;
    let electron;

    for (let cont = 1; cont <= posElectrons.length; cont++) {
        let pair = JSON.stringify(posElectrons[cont - 1]);
        switch (pair) {
            case JSON.stringify([true, true]):
                electron = new THREE.Mesh(geometryElectron, materialElectron);
                dummies[nucleus.id].add(electron);
                electron.userData.electron = true;
                electron.userData.pair = true;
                electron.position.set((Math.cos((angle[cont - 1] - 20) * 0.017453292519943295) * radio), (Math.sin((angle[cont - 1] - 20) * 0.017453292519943295) * radio), 0);

                electron = new THREE.Mesh(geometryElectron, materialElectron);
                dummies[nucleus.id].add(electron);
                electron.userData.electron = true;
                electron.userData.pair = true;
                electron.position.set((Math.cos((angle[cont - 1] + 20) * 0.017453292519943295) * radio), (Math.sin((angle[cont - 1] + 20) * 0.017453292519943295) * radio), 0);
                break;

            case JSON.stringify([true, false]):
                electron = new THREE.Mesh(geometryElectron, materialElectron);
                dummies[nucleus.id].add(electron);
                electron.userData.electron = true;
                electron.position.set((Math.cos(angle[cont - 1] * 0.017453292519943295) * radio), (Math.sin(angle[cont - 1] * 0.017453292519943295) * radio), 0);
                break;
        }
    }
}
//End Init Atom

//functions
export function crearAtomo(event) {
    container.style.zIndex = 1;
    let selected = event.currentTarget;
    console.log(selected);

    let nucleo = createNucleus(getColor(selected), radioAtomico(selected.getAttribute("data-periodo"), selected.getAttribute("data-grupo")));
    atomSelected = nucleo.id;
    nucleo.name = "nucleo";
    nucleo.position.set(raycasterX, raycasterY, 0);

    const nombre = attachableHTML(nucleo, selected.getAttribute("data-simbolo"));
    nombre.setAttribute("class", "nombre3D");

    elemento[atomSelected] = new infoObj(selected, nucleo);
    //console.log(elemento[atomSelected].configE.lewis);
    //console.log(elemento[atomSelected].configE.valencia);

    createElectrons(nucleo, elemento[atomSelected].configE.valencia);

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

function nombreCompuesto(compuestosArray, componentesArray) {
    let nombre = "", index;
    for (let cont = 0; cont < compuestosArray.length; cont++) {
        let check = compuestosArray[cont];
        for (let cont1 = cont + 1; cont1 < compuestosArray.length; cont1++) {
            let checking = compuestosArray[cont1];

            if (check.simbolo == checking.simbolo) {
                check.subindice = check.subindice + checking.subindice;

                index = compuestosArray.map(e => e.id).indexOf(compuestosArray[cont1].id);
                if (index > -1) {
                    compuestosArray.splice(index, 1);
                }
            }
        }
        if (check.subindice <= 1) {
            nombre += check.simbolo;
        } else {
            let sub = check.subindice.toString();
            nombre += check.simbolo + sub.sub();
        }
    }

    let oxidacion = 0;
    for (let cont = 0; cont < componentesArray.length; cont++) {
        oxidacion += parseInt(componentesArray[cont].oxidacion);
    }

    if (oxidacion != 0) {
        oxidacion = oxidacion.toString();
        nombre = "(" + nombre + ")" + oxidacion.sup();
    }

    return nombre;
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

function calculateAttract(){
	const speed = 2;
	const minDistance = 250;

	attractions.forEach(item => {
        // Obtener posiciones de los objetos
        let pos1 = item.nucleo1.position;
        let pos2 = item.nucleo2.position;

        // Calcular la dirección del objeto 1 al objeto 2
        let direction = new THREE.Vector3().subVectors(pos2, pos1).normalize();

        // Calcular la distancia entre los objetos
        let distance = pos1.distanceTo(pos2);

        // Si la distancia es mayor que el mínimo, mover los objetos
        if (distance > minDistance) {
            let newPos1 = pos1.add(direction.clone().multiplyScalar(speed));
            let newPos2 = pos2.add(direction.clone().multiplyScalar(-speed));
	
			elemento[item.nucleo1.id].x = newPos1.x;
			elemento[item.nucleo1.id].y = newPos1.y;

			elemento[item.nucleo2.id].x = newPos2.x;
			elemento[item.nucleo2.id].y = newPos2.y;

			dummies[item.nucleo1.id].position.set(newPos1.x, newPos1.y, 0);
			dummies[item.nucleo2.id].position.set(newPos2.x, newPos2.y, 0); 
		}

		/*

		let posGlobal1 = new THREE.Vector3();
		let posGlobal2 = new THREE.Vector3();

		// Calcular la posición de los electrones en el espacio
		let subpos1 = item.electron1.getWorldPosition(posGlobal1);
		let subpos2 = item.electron2.getWorldPosition(posGlobal2);

		// Calcular la distancia entre los dos electrones
		let distance2 = subpos1.distanceTo(subpos2);

		// Calcular el vector entre los dos electrones
		let vectorX = subpos2.x - subpos1.x;
		let vectorY = subpos2.y - subpos1.y;

		// Calcular el ángulo entre los electrones
		let angleBetweenElectrons = Math.atan2(vectorY, vectorX);

		// Calcular el ángulo para el dummy1 (usando el ángulo entre los electrones)
		dummies[item.nucleo1.id].rotation.z = angleBetweenElectrons;
		dummies[item.nucleo2.id].rotation.z = angleBetweenElectrons;
		*/
	});	
}

export {
    gravedad, vida, onMouseMove, elemento, atomSelected, toScreenPosition, tiempo, oxi, descomponer,
    dummies, raycasterX, raycasterY, follow, relLink, objUpdate, calculateAttract
}
