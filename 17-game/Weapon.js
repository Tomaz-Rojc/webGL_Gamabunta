import { Node } from './Node.js';
import { Physics } from './Physics.js';

export class Weapon extends Node {

    constructor(mesh, image, options) {
        super(options);
        this.mesh = mesh;
        this.image = image;
        this.shooting = false;
        this.boomeranging = false;
        this.melee = false;
        this.weaponType = options.weaponType;
    }

    addPhysics(scene) {
        this.scene = scene;
        this.physics = new Physics(scene);
    }

    reset() {
        if(this.weaponType === 'melee') {
            this.translation[0] = 2;
            this.translation[1] = -1;
            this.translation[2] = -1;
        } else {
            this.translation[0] = 4;
            this.translation[1] = 0;
            this.translation[2] = -4;
        }
        this.updateTransform();
    }

    animateAttack() {
        let frame = 0;
        const anim = setInterval(() => {
            this.rotation[1] += 0.5;
            this.updateTransform();
            this.physics.attack(this);
            frame += 1;
            if(frame >= 60)
                clearInterval(anim);
        }, 1);

        setTimeout(() => {
            this.melee = false;
            this.reset();
        }, 300)
    }

    animateBoomerang() {
        let frame = -60;
        this.rotation = [0,0,0];
        const anim = setInterval(() => {
            frame += 1;
            if(frame <= 0) {
                this.translation[0] -= 0.05;
                this.translation[2] -= 0.15;
            } else {
                this.translation[0] += 0.05;
                this.translation[2] += 0.15;
            }
            this.rotation[0] += 0.5;
            this.rotation[1] += 0.5;
            this.updateTransform();
            this.physics.attack(this);
            if(frame >= 60)
                clearInterval(anim);
        }, 1);

        setTimeout(() => {
            this.boomeranging = false;
        }, 1000)
    }

    animateShot() {
        let frame = -30;
        this.translation = [0,0,0]
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
            this.scale = [0.3, 5, 0.3];
            this.shooting = false;
            this.reset();
        }, 1000)
    }

    attack() {
        if(!this.melee) {
            this.melee = true;
            this.animateAttack();
        }
    }

    shoot() {
        if(!this.shooting) {
            this.shooting = true;
            this.animateShot();
        }
    }

    boomerang() {
        if(!this.boomeranging) {
            this.boomeranging = true;
            this.animateBoomerang();
        }
    }

}
