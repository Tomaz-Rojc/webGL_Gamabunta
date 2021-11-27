import { Node } from './Node.js';

export class Weapon extends Node {

    constructor(mesh, image, options) {
        super(options);
        this.mesh = mesh;
        this.image = image;
    }

    animate() {
        let frame = 0;
        const anim = setInterval(() => {
            this.rotation[1] += 1;
            this.updateTransform();
            frame += 1;
            console.log(frame)
            if(frame >= 60)
                clearInterval(anim);
        }, 1);
    }

}
