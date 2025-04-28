import {torus, renderer, scene, camera, point} from './init.js';
import {electron2, proton, neutron,
    ElectronRenderer, ProtonRenderer, NeutronRenderer,
    ElectronCamera, ProtonCamera, NeutronCamera, 
    ModelosScene} from './modelInit.js';

const stop = {
    value: true
};
var fpsInterval, startTime, now, then, elapsed;

const startAnimation = (fps) => {
    fpsInterval = 1000 / fps;
    then = window.performance.now();
    startTime = then;
    //console.log(startTime);
    animate();
}

function rotateTorus(item) {
    //item.rotateX(item.userData.angleX);
    //item.rotateY(item.userData.angleY);
    //item.rotateZ(item.userData.angleZ);

    item.rotateZ(0.05);
}

function animate(newtime) {
    // request another frame
    requestAnimationFrame(animate);

    // calc elapsed time since last loop
    now = newtime;
    elapsed = now - then;

    // if enough time has elapsed, draw the next frame
    if (elapsed > fpsInterval) {
        let startTime = performance.now();
        // Get ready for next frame by setting then=now, but...
        // Also, adjust for fpsInterval not being multiple of 16.67
        then = now - (elapsed % fpsInterval);

        // draw stuff here

        if (stop.value) {
            point.rotateY(0.05);
            point.rotateX(0.05);
            point.rotateZ(0.05);

            torus.forEach(rotateTorus);
        }

        electron2.userData.angle += 7.5;
        electron2.rotation.x = Math.cos(electron2.userData.angle * 0.017453292519943295);
        electron2.rotation.y = Math.sin(electron2.userData.angle * 0.017453292519943295);

        proton.userData.angle += 7.5;
        proton.rotation.x = Math.cos(proton.userData.angle * 0.017453292519943295);
        proton.rotation.y = Math.sin(proton.userData.angle * 0.017453292519943295);

        neutron.userData.angle += 7.5;
        neutron.rotation.x = Math.cos(neutron.userData.angle * 0.017453292519943295);
        neutron.rotation.y = Math.sin(neutron.userData.angle * 0.017453292519943295);

        renderer.render(scene, camera);
        ElectronRenderer.render(ModelosScene, ElectronCamera);
        ProtonRenderer.render(ModelosScene, ProtonCamera);
        NeutronRenderer.render(ModelosScene, NeutronCamera);

        frames++;
        let endTime = performance.now();
        //console.log(`This code took ${endTime - startTime} milliseconds to execute.`);
    }

}

export {startAnimation, stop};