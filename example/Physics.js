import Enemy from './Enemy.js';
import Weapon from './Weapon.js';

const vec3 = glMatrix.vec3;
const mat4 = glMatrix.mat4;

export default class Physics {

    constructor(scene) {
        this.scene = scene;
        this.world = new OIMO.World({
            timestep: 1 / 60,
            iterations: 8,
            broadphase: 2, // 1 brute force, 2 sweep and prune, 3 volume tree
            worldscale: 1, // scale full world
            random: true,  // randomize sample
            info: false,   // calculate statistic or not
            gravity: [0, 0, 0]
        });

        //this.enemyCount = 0;
        this.win = false;
        this.lose = false;
        this.timeLeft = 45.0;
        this.timeSurvived = 0.0;

        this.scene.traverse(node => {
            if (node.camera) {
                node.fizik = this.world.add(node.body);
            }
            if (node.options.name.split('.')[0] === "Floor" || node.options.name.split('.')[0] === "Bridge") {
                node.fizik = this.world.add(node.body);
            }
            if (node.options.name === "Water") {
                node.fizik = this.world.add(node.body);
            }
            if (node.options.name.split('.')[0] === "Enemy") {
                node.fizik = this.world.add(node.body);
                node.enemy = new Enemy(node);
                this.enemyCount++;
            }
            if (node.options.name === "Weapon") {
                node.weapon = new Weapon(node);
            }
        });
    }

    update(dt) {
        this.world.step();
        this.scene.traverse(node => {
            if (node.camera && node.options.name === "Camera") {
                // node.fizik.applyImpulse({x: 0, y: 0, z: 0}, node.camera.getVelocity());
                let v = node.camera.getVelocity();
                node.fizik.linearVelocity.set(v.x, v.y, v.z);

                //console.log(node.translation, node.fizik.pos);

                let pos = node.fizik.getPosition();
                node.translation[0] = pos.x;
                node.translation[1] = pos.y;
                node.translation[2] = pos.z;
                node.updateTransform();
                if (pos.y < -2) {
                    node.fizik.resetPosition(0, 0, 0);
                    this.timeLeft -= 5;
                }

                this.scene.traverse(w => {
                    if (w.weapon) {
                        w.weapon.update(dt, node, w.matrix);
                        w.updateTransform();
                    }
                });

                if (node.camera.isAttacking()) {
                    this.scene.traverse(enemy => {
                        if (enemy.enemy) {
                            let a = node.fizik.getPosition();
                            let b = enemy.fizik.getPosition();
                            let x = Math.abs(a.x - b.x);
                            let y = Math.abs(a.y - b.y);
                            let z = Math.abs(a.z - b.z);

                            let dist = x + y + z;
                            if (dist < 5.0) {
                                enemy.fizik.resetPosition(-100, -200, -100);
                                var audio = new Audio('common/sounds/death2.mp3');
                                audio.play();
                                this.enemyCount--;
                                this.slain++;
                                enemy.enemy.isDead();
                                this.timeLeft += 2;
                            }
                        }

                    });
                }
            }
            if (node.enemy) {
                node.enemy.update(dt);
                //node.fizik.applyImpulse({x: 0, y: 0, z: 0}, node.enemy.getVelocity());
                let v = node.enemy.getVelocity();
                node.fizik.linearVelocity.set(v.x, v.y, v.z);
                
                let pos = node.fizik.getPosition();
                node.translation[0] = pos.x;
                node.translation[1] = pos.y - 1;
                node.translation[2] = pos.z;
                node.updateTransform();

                let x = Math.abs(pos.x);
                let y = Math.abs(pos.y);
                let z = Math.abs(pos.z);

                let dist = x + y + z;
                if (dist < 2) {
                    node.fizik.resetPosition(-100, -200, -100);
                    node.enemy.isDead();
                    this.enemyCount--;
                    this.timeLeft -= 2;
                }
            }
        });
        if (this.timeLeft < 0 && !this.win) {
            document.getElementById("win").style.visibility = "visible";
            document.exitPointerLock();
            document.getElementById("score").innerHTML = Math.floor(this.timeSurvived);
            var m = new Audio('common/sounds/passed.mp3');
            m.volume = 0.1;
            m.play();
            this.win = true;
        }
        document.getElementById("time").innerHTML = Math.ceil(this.timeLeft);
        document.getElementById("survived").innerHTML = Math.floor(this.timeSurvived);

        this.timeLeft -= dt;
        this.timeSurvived += dt;
    }

    intervalIntersection(min1, max1, min2, max2) {
        return !(min1 > max2 || min2 > max1);
    }
    
    distance(a, b) {
        let x = Math.abs(a[0] - b[0]);
        let y = Math.abs(a[1] - b[1]);
        let z = Math.abs(a[2] - b[2]);

        return x + y + z;
    }

}
