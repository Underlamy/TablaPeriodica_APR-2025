import {vida, gravedad, onMouseMove, elemento, atomSelected, toScreenPosition, fusionar} from './functions/interactive.js';
import {renderer, scene, camera} from './init.js';

//animation functions
setInterval(function () {
    gravedad();

    renderer.render(scene, camera);
}, 10);

setInterval(function () {
    window.addEventListener('mousemove', onMouseMove);

    for (let cont = 0; cont < elemento.length; cont++) {
        if (elemento[cont] != undefined) {
            let element = scene.getObjectById(cont);
            if (element != undefined && element != null) {

                elemento[cont].angle = elemento[cont].angle + 1;
                let cos = Math.cos(elemento[cont].angle * Math.PI / 180);
                let sin = Math.sin(elemento[cont].angle * Math.PI / 180);

                element.rotation.x = cos;
                element.rotation.y = sin;

                if (elemento[cont].oxidacion != 0 && atomSelected != cont) {
                    let shake = elemento[cont].oxidacion * 25 / 8;
                    if (shake < 0) {
                        shake = shake * -1;
                    }

                    if (shake >= 25) {
                        shake = 25;
                    }

                    if (Math.random() * 1 > 0.5) {
                        element.position.x = elemento[cont].x + ((Math.random() * shake));
                    }
                    else {
                        element.position.x = elemento[cont].x - ((Math.random() * shake));
                    }

                    if (Math.random() * 1 > 0.5) {
                        element.position.y = elemento[cont].y + ((Math.random() * shake));
                    }
                    else {
                        element.position.y = elemento[cont].y - ((Math.random() * shake));
                    }
                }
                let wiwi = toScreenPosition(element, camera);
                document.getElementById(cont).style.left = (wiwi.x - 20) + "px";
                document.getElementById(cont).style.top = (wiwi.y - 20) + "px";

                for (let cont1 = 0; cont1 < elemento.length; cont1++) {
                    if (elemento[cont1] != undefined && cont != cont1 && atomSelected != cont && atomSelected != cont1) {
                        fusionar(cont, cont1);
                    }
                }
            }
        }
    }
}, 40);

setInterval(function () {
    vida();
}, 1000);