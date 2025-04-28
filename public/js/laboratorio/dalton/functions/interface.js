import {warn} from '../alert.js';
import {scene} from '../init.js';
import { atomSelected, elemento, tiempo, oxi, descomponer } from "./interactive.js";
import {info} from '../infoInit.js';

window.addEventListener("resize", () => {
    camera.aspect = getWidth() / getHeight();
    camera.updateProjectionMatrix();

    vFOV = (camera.fov * Math.PI) / 180;
    height = 2 * Math.tan(vFOV / 2) * Math.abs(camera.position.z);
    width = height * camera.aspect;

    borderX = width / 2;
    borderY = height / 2;
}, false);

function eliminar(event) {
    if (event.clientX >= (window.innerWidth * 0.81)) {
        if (elemento[atomSelected].elemento == true) {
            warn("warning", "elemento " + document.getElementById(atomSelected).innerHTML + " eliminado");
        } else {
            warn("warning", "compuesto " + document.getElementById(atomSelected).innerHTML + " eliminado");
        }
        console.warn("OBJETO " + atomSelected + " ELIMINADO");

        scene.remove(scene.getObjectById(atomSelected));
        document.getElementById(atomSelected).remove();
        elemento[atomSelected] = undefined;
        if (document.getElementById("info" + atomSelected)) {
            document.getElementById("info" + atomSelected).style.opacity = 0;
            info(undefined, undefined, undefined);
        }

        tiempo.splice(atomSelected, 1);
        oxi.splice(atomSelected, 1);

        //atomSelected = undefined;
    }
}

function basura() {
    let basurero = document.getElementsByClassName("trashcan")[0];
    let simbolo = document.getElementById(atomSelected);

    if (parseInt(simbolo.style.top) >= parseInt(window.getComputedStyle(basurero).top) - 50 && parseInt(simbolo.style.left) >= parseInt(window.getComputedStyle(basurero).left) - 50) {
        if (elemento[atomSelected].elemento == true) {
            warn("warning", "elemento " + document.getElementById(atomSelected).innerHTML + " eliminado");
        } else {
            warn("warning", "compuesto " + document.getElementById(atomSelected).innerHTML + " eliminado");
        }

        if (document.getElementById("info" + atomSelected)) {
            document.getElementById("info" + atomSelected).style.opacity = 0;
            info(undefined, undefined, undefined);
        }

        descomponer(atomSelected);
    }
}

export {eliminar, basura}