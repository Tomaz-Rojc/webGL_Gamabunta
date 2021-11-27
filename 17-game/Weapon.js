import { Node } from './Node.js';
import { Physics } from './Physics.js';

export class Weapon extends Node {

    constructor(mesh, image, options) {
        super(options);
        this.mesh = mesh;
        this.image = image;
        this.shooting = false;
    }

    addPhysics(scene) {
        this.scene = scene;
        this.physics = new Physics(scene);
    }

    animateAttack() {
        let frame = 0;
        const anim = setInterval(() => {
            this.rotation[1] += 1;
            this.updateTransform();
            frame += 1;
            if(frame >= 60)
                clearInterval(anim);
        }, 1);
    }

    animateBoomerang() {
        let frame = -30;
        const anim = setInterval(() => {
            frame += 1;
            if(frame <= 0) {
                this.translation[0] -= 0.2;
                this.translation[2] -= 0.6;
            } else {
                this.translation[0] += 0.2;
                this.translation[2] += 0.6;
            }
            this.updateTransform();
            if(frame >= 30)
                clearInterval(anim);
        }, 1);
    }

    animateShot() {
        let frame = -30;
        const anim = setInterval(() => {
            frame += 1;
            this.translation[0] -= 0.2;
            this.translation[2] -= 1;
            this.updateTransform();
            this.physics.attack(this);
            if(frame >= 30){
                this.scale = [0,0,0];
                this.updateTransform();
                clearInterval(anim);
            }
        }, 1);

        setTimeout(() => {
            this.scale = [0.5,0.5,1];
            this.shooting = false;
            this.translation[0] = 1;
            this.translation[2] = -2;
            this.updateTransform();
        }, 1000)
    }

    attack() {
        this.animateAttack();
        this.physics.attack(this);
    }

    shoot() {
        if(!this.shooting) {
            this.shooting = true;
            this.animateShot();
        }
    }

}
