const vec3 = glMatrix.vec3;
const mat4 = glMatrix.mat4;
const quat = glMatrix.quat;

export default class Node {

    constructor(options = {}) {
        this.options = options;
        this.translation = options.translation
            ? vec3.clone(options.translation)
            : vec3.fromValues(0, 0, 0);
        this.rotation = options.rotation
            ? quat.clone(options.rotation)
            : quat.fromValues(0, 0, 0, 1);
        this.scale = options.scale
            ? vec3.clone(options.scale)
            : vec3.fromValues(1, 1, 1);
        this.matrix = options.matrix
            ? mat4.clone(options.matrix)
            : mat4.create();

        let k = this.toEulerAngles(this.rotation);
        k.roll *= 180 / Math.PI;
        k.yaw *= 180 / Math.PI;
        k.pitch *= 180 / Math.PI;

        this.body = {
            type: 'box',
            pos: [
                this.translation[0],
                this.translation[1],
                this.translation[2]
            ],
            size: [
                this.scale[0] * 2,
                this.scale[1] * 2,
                this.scale[2] * 2
            ],
            rot: [k.roll, k.pitch, 0],
            move: false,
            density: 1,
            friction: 1,
            restitution: 0,
            belongsTo: 1,
            collidesWith: 0xffffffff,
        };

        this.fizik;

        this.rotationDeg = [0, 0, 0];

        if (options.matrix) {
            this.updateMatrix();
        } else if (options.translation || options.rotation || options.scale) {
            if (options.name === "Camera") {
                this.body.move = true;
                this.body.type = 'sphere';
                this.body.size = [1.5, 1.5, 1.5];
                this.body.density = 0.1;
                this.updateTransform();
            } else if (options.name.split('.')[0] === "Enemy") {
                this.body.type = 'sphere';
                this.body.move = true;
                this.body.size = [0.2, 0.5, 0.2];
                this.body.pos[1] = -0.5;
                this.body.density = 0.1;
                this.updateTransform();
            } else {
                this.updateMatrix();
            }
        }

        this.camera = options.camera || null;
        this.mesh = options.mesh || null;


        this.children = [...(options.children || [])];
        for (const child of this.children) {
            child.parent = this;
        }
        this.parent = null;

    }

    updateTransform() {
        const t = this.matrix;
        const degrees = this.rotationDeg.map(x => x * 180 / Math.PI);
        const q = quat.fromEuler(quat.create(), ...degrees);
        const v = vec3.clone(this.translation);
        const s = vec3.clone(this.scale);
        mat4.fromRotationTranslationScale(t, q, v, s);
    }

    updateMatrix() {
        mat4.fromRotationTranslationScale(
            this.matrix,
            this.rotation,
            this.translation,
            this.scale);
    }

    addChild(node) {
        this.children.push(node);
        node.parent = this;
    }

    removeChild(node) {
        const index = this.children.indexOf(node);
        if (index >= 0) {
            this.children.splice(index, 1);
            node.parent = null;
        }
    }

    clone() {
        return new Node({
            ...this,
            children: this.children.map(child => child.clone()),
        });
    }

    getGlobalTransform() {
        if (!this.parent) {
            return mat4.clone(this.matrix);
        } else {
            let transform = this.parent.getGlobalTransform();
            return mat4.mul(transform, transform, this.matrix);
        }
    }

    toEulerAngles(kk) {
        let q = {x: kk[0], y: kk[1], z: kk[2], w: kk[3]};
        let angles = {roll: 0, pitch: 0, yaw: 0};

        // roll (x-axis rotation)
        let sinr_cosp = 2 * (q.w * q.x + q.y * q.z);
        let cosr_cosp = 1 - 2 * (q.x * q.x + q.y * q.y);
        angles.roll = Math.atan2(sinr_cosp, cosr_cosp);

        // pitch (y-axis rotation)
        let sinp = 2 * (q.w * q.y - q.z * q.x);
        if (Math.abs(sinp) >= 1)
            angles.pitch = Math.sign(sinp) * Math.PI / 2; // use 90 degrees if out of range
        else
            angles.pitch = Math.asin(sinp);

        // yaw (z-axis rotation)
        let siny_cosp = 2 * (q.w * q.z + q.x * q.y);
        let cosy_cosp = 1 - 2 * (q.y * q.y + q.z * q.z);
        angles.yaw = Math.atan2(siny_cosp, cosy_cosp);

        return angles;
    }

}
