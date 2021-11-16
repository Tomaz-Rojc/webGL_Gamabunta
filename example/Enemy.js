import Node from './Node.js';

const mat4 = glMatrix.mat4;
const vec3 = glMatrix.vec3;
const quat = glMatrix.quat;

export default class Enemy extends Node {
    constructor(transformacija) {
        super({});
        this.velocity = vec3.fromValues(0, 0, 0);
        this.maxSpeed = 3;
        this.friction = 0.2;
        this.acceleration = 100;

        this.rot = [0, 0, 0];
        this.dir = [0, 0, 0];

        this.timeToMove = 1.0;
        this.timeBetweenMove = Math.random() * 5;
        
        
        this.dead = false;
        this.deadTime = 1.0;

        this.move = false;
        this.wait = true;
        this.transformacija = transformacija;
        const orient = mat4.create();
        mat4.lookAt(orient, this.transformacija.translation, [0, 0, 0], [0, 1, 0]); // [0, 0, 0] pozicija ognja spremeni!!!
        const q = quat.fromValues(0, 0, 0, 1);
        mat4.getRotation(q, orient);

        let k = this.toEulerAngles(q);
        this.dir[1] = -k.roll;

        this.forward = vec3.set(vec3.create(), -this.transformacija.translation[0], 0, -this.transformacija.translation[2]);
        this.originalPos = vec3.create();
        this.originalPos[0] = this.transformacija.translation[0];
        this.originalPos[1] = this.body.pos[1];
        this.originalPos[2] = this.transformacija.translation[2];
    }


    setTransformation(transformacija) {

    }
    
    isDead(){
        this.dead = true;
        this.deadTime = Math.random() * 5 + 3;
    }

    getVelocity() {
        let a = this.velocity[0];
        let b = 0;
        let c = this.velocity[2];

        let v = {
            x: a,
            y: b,
            z: c
        }

        return v;
    }

    update(dt) {
        const c = this.transformacija;

        if(!this.dead){
            if (this.timeToMove > 0.0) {
                this.timeToMove -= dt;
            } else if (this.timeToMove < 0.0 && !this.wait) {
                vec3.scale(this.velocity, this.velocity, 0);
                let pos = c.fizik.getPosition();
                c.fizik.resetPosition(pos.x, pos.y, pos.z);
                this.timeBetweenMove = 1.0;
                this.move = false;
                this.wait = true;
            }

            if (this.timeBetweenMove > 0.0) {
                this.timeBetweenMove -= dt;
                this.updateRotation(dt);
            } else if (this.timeBetweenMove < 0.0 && !this.move) {


                let acc = vec3.create();
                vec3.add(acc, acc, this.forward);

                vec3.scaleAndAdd(this.velocity, this.velocity, acc, dt * this.acceleration);

                const len = vec3.len(this.velocity);
                if (len > this.maxSpeed) {
                    vec3.scale(this.velocity, this.velocity, this.maxSpeed / len);
                }
                this.timeToMove = 1.0;
                this.wait = false;
                this.move = true;
            }
        }else{
            if(this.deadTime < 0){

                c.fizik.resetPosition(this.originalPos[0], this.originalPos[1], this.originalPos[2]);
                this.dead = false;
            }else{
                this.deadTime -= dt;
            }
        }

    }

    updateRotation(dt) {
        const c = this.transformacija;
        const pi = Math.PI;
        const twopi = pi * 2;
        const halfpi = pi / 2;

        this.rot[1] += dt * twopi;
        this.rot[1] = ((this.rot[1] % twopi) + twopi) % twopi;
        c.rotationDeg = this.rot;
    }

    toEulerAngles(kk) {
        let q = {x: kk[0], y: kk[1], z: kk[2], w: kk[3]};
        let angles = {roll: 0, pitch: 0, yaw: 0};

        let sinr_cosp = 2 * (q.w * q.x + q.y * q.z);
        let cosr_cosp = 1 - 2 * (q.x * q.x + q.y * q.y);
        angles.roll = Math.atan2(sinr_cosp, cosr_cosp);

        let sinp = 2 * (q.w * q.y - q.z * q.x);
        if (Math.abs(sinp) >= 1)
            angles.pitch = Math.sign(sinp) * Math.PI / 2; // use 90 degrees if out of range
        else
            angles.pitch = Math.asin(sinp);

        let siny_cosp = 2 * (q.w * q.z + q.x * q.y);
        let cosy_cosp = 1 - 2 * (q.y * q.y + q.z * q.z);
        angles.yaw = Math.atan2(siny_cosp, cosy_cosp);

        return angles;
    }
}
