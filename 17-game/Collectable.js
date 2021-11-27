import { Node } from './Node.js';
import { Physics } from './Physics.js';

export class Collectable extends Node {

    constructor(mesh, image, options) {
        super(options);
        this.mesh = mesh;
        this.image = image;
        this.startAnimation();
    }

    addPhysics(scene) {
        this.scene = scene;
        this.physics = new Physics(scene);
    }

    startAnimation() {
        setInterval(() => {
            this.rotation[1] += 0.1;
            this.updateTransform();
        }, 60);
    }

    pickup() {

    }
}
