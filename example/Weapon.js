import Node from './Node.js';

const mat4 = glMatrix.mat4;
const vec3 = glMatrix.vec3;
const quat = glMatrix.quat;

export default class Weapon extends Node {
    constructor(transformacija) {
        super({});
        this.transformacija = transformacija;


        this.attackSpeed = 3;
        this.rot = [0, 0, 0];
    }


    update(dt, camera, matrix) {
        const c = this.transformacija;

        let mat = mat4.create();
        mat4.fromTranslation(mat, c.translation);

        let out = mat4.create();

        mat4.mul(c.matrix, camera.matrix, mat);

        if (camera.camera.isAttacking()) {
            this.updateRotation(dt);
        } else {
            this.rot = [0, 0, 0];
            c.rotationDeg = this.rot;
        }
    }

    updateRotation(dt) {
        const c = this.transformacija;

        this.rot[0] -= dt * this.attackSpeed;
    }
}
