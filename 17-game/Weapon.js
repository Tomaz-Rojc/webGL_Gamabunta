import { Node } from './Node.js';
import { Physics } from './Physics.js';

export class Weapon extends Node {

    constructor(mesh, image, options) {
        super(options);
        this.mesh = mesh;
        this.image = image;
    }

    addPhysics(scene) {
        this.scene = scene;
        this.physics = new Physics(scene);
    }

    animate() {
        let frame = 0;
        const anim = setInterval(() => {
            this.rotation[1] += 1;
            this.updateTransform();
            frame += 1;
            if(frame >= 60)
                clearInterval(anim);
        }, 1);
    }

    attack() {
        this.physics.attack(this, this.scene);
    }

}
