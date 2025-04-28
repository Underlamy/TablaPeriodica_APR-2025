import * as THREE from '../../three.module.js';
import { vida, gravedad, onMouseMove, elemento, atomSelected, toScreenPosition,
    dummies, raycasterX, raycasterY, follow, relLink, objUpdate, calculateAttract } from './functions/interactive.js';
import { renderer, scene, camera } from './init.js';

//Calculate loop
setInterval(function () {
    calculateAttract();

    renderer.render(scene, camera);
}, 40);

//Animation loop
setInterval(function () {
    window.addEventListener('mousemove', onMouseMove);

    elemento.forEach(function (item, index) {
        let element = scene.getObjectById(index);
        if (element != undefined && element != null) {
            element.rotateX(0.05);
            element.rotateY(0.05);

            if (item.oxidacion != 0 && atomSelected != index) {
                let shake = item.oxidacion * 25 / 8;
                if (shake < 0) {
                    shake = shake * -1;
                }

                if (shake >= 25) {
                    shake = 25;
                }

                if (Math.random() * 1 > 0.5) {
                    element.position.x = item.x + ((Math.random() * shake));
                }
                else {
                    element.position.x = item.x - ((Math.random() * shake));
                }

                if (Math.random() * 1 > 0.5) {
                    element.position.y = item.y + ((Math.random() * shake));
                }
                else {
                    element.position.y = item.y - ((Math.random() * shake));
                }
            }

            let wiwi = toScreenPosition(element, camera);
            document.getElementById(index).style.left = (wiwi.x - 20) + "px";
            document.getElementById(index).style.top = (wiwi.y - 20) + "px";
        }
    });

    dummies.forEach(element => {
        if (element.userData.rotate) {
            //element.rotateZ(0.0523599);
        } else if (element.userData.rotate == false){
            var x = Math.round(follow.getWorldPosition(new THREE.Vector3()).x - element.position.x);
            var y = Math.round(follow.getWorldPosition(new THREE.Vector3()).y - element.position.y);
            var radians = Math.atan2(y, x);
            if (radians < 0) radians += 2 * Math.PI;
            var degrees = Math.round(radians * 180 / Math.PI);

            var mousex = Math.round(raycasterX - element.position.x);
            var mousey = Math.round(raycasterY - element.position.y);
            var mouseradians = Math.atan2(mousey, mousex);
            if (mouseradians < 0) mouseradians += 2 * Math.PI;
            var mousedegrees = Math.round(mouseradians * 180 / Math.PI);

            let innerAngle = (mousedegrees - degrees + 180 + 360) % 360 - 180;
            
            if(innerAngle >= 0){
                element.rotateZ(0.0523599);
            }else{
                element.rotateZ(-0.0523599);
            }
        }
    });

    objUpdate.forEach(element => {
        element.userData.animationUpdate();
    });

    renderer.render(scene, camera);
}, 40);

/*
setInterval(function () {
    vida();
}, 1000);
*//*
setInterval(function () {
    vida();
}, 1000);
*/
