import { vec3, mat4 } from '../../lib/gl-matrix-module.js';

import { Utils } from './Utils.js';
import { Node } from './Node.js';
import { Weapon } from './Weapon.js';

export class Camera extends Node {

    constructor(options) {
        super(options);
        Utils.init(this, this.constructor.defaults, options);

        this.projection = mat4.create();
        this.updateProjection();

        this.mousemoveHandler = this.mousemoveHandler.bind(this);
        this.keydownHandler = this.keydownHandler.bind(this);
        this.keyupHandler = this.keyupHandler.bind(this);
        this.keys = {};

        this.dash = false;
        this.dashOnCooldown = false;
        this.dashCooldownStart = -1;
        this.stamina = 0;
        this.running = false;
        this.jump = false;
        this.doubleJump = false;
        this.doubleJumpAvailable = false;
        setInterval(() => {
            this.translation[1] -= 0.2;
        }, 10);
    }

    updateProjection() {
        mat4.perspective(this.projection, this.fov, this.aspect, this.near, this.far);
    }

    update(dt) {
        const c = this;

        const forward = vec3.set(vec3.create(),
            -Math.sin(c.rotation[1]), 0, -Math.cos(c.rotation[1]));
        const right = vec3.set(vec3.create(),
            Math.cos(c.rotation[1]), 0, -Math.sin(c.rotation[1]));

        // 1: add movement acceleration
        let acc = vec3.create();
        if (this.keys['KeyW']) {
            vec3.add(acc, acc, forward);
        }
        if (this.keys['KeyS']) {
            vec3.sub(acc, acc, forward);
        }
        if (this.keys['KeyD']) {
            vec3.add(acc, acc, right);
        }
        if (this.keys['KeyA']) {
            vec3.sub(acc, acc, right);
        }

        // check for dash
        if (this.keys['KeyQ'] && !c.dashOnCooldown) {
            c.dash = true;
            c.dashOnCooldown = true;

            // dash loading bar:
            c.dashCooldownStart = Date.now();
            var elem = document.getElementById("myBar");
            var width = 0;
            var id = setInterval(frame, 10);
            function frame() {
                if (width >= 100) {
                    clearInterval(id);
                } else {
                    const time = Date.now();
                    width = parseInt(100 - (c.dashCooldownStart - time + c.dashCooldown)*100/c.dashCooldown);
                    elem.style.width = width + "%";
                }
            }
            setTimeout(function(){ c.dash = false; }, 150);
            setTimeout(function(){ c.dashOnCooldown = false; }, c.dashCooldown);
        }


        // check for jump
        if (this.keys['Space'] && !this.jump && ((1.6999 < this.translation[1] && this.translation[1] < 1.71) || 
            (3.6999 < this.translation[1] && this.translation[1] < 3.71) || (5.6999 < this.translation[1] && this.translation[1] < 5.71))) {
            this.doubleJumpAvailable = false;
            this.jump = true;
            var inAir = 0;
            var id1 = setInterval(() => {
                var s = (17 - inAir) * 0.04;
                c.translation[1] += s;
                inAir += 1;
                if (inAir > 17) {
                    clearInterval(id1);
                }
            }, 10);
            // in 0.5 seconds you will be able to jump again
            setTimeout(() => {
                this.jump = false;
            }, 500);
        }

        // check for double jump
        if (this.keys['Space'] && this.jump && this.doubleJumpAvailable && !this.doubleJump) {
            this.doubleJump = true;
            this.doubleJumpAvailable = false;

            // in 700 miliseconds you will be able to double jump again
            setTimeout(() => {
                this.doubleJump = false;
            }, 700);

            var inAir2 = 0;
            var id1 = setInterval(() => {
                var s = (17 - inAir2) * 0.04;
                c.translation[1] += s;
                inAir2 += 1;
                if (inAir2 > 17) {
                    clearInterval(id1);
                }
            }, 10);
        }

        // 2: update velocity
        if (c.dash) {
            c.running = false;
            c.maxSpeed = 50;
            vec3.scaleAndAdd(c.velocity, c.velocity, acc, dt * 1000);
            c.fov = 1.6;
            c.updateProjection();
        } else if (this.keys['ShiftLeft'] && c.stamina < 500) {
            if (!c.running) {
                c.running = true;
                var id = setInterval(() => {
                    if (!c.running) {
                        clearInterval(id);
                    } else {
                        c.stamina += 20;
                    }
                }, 10);
            }  
            c.maxSpeed = 10;
            vec3.scaleAndAdd(c.velocity, c.velocity, acc, dt * c.acceleration);
            
        } else {
            c.running = false;
            c.maxSpeed = 5;
            vec3.scaleAndAdd(c.velocity, c.velocity, acc, dt * c.acceleration);
            c.fov = 1.5;
            c.updateProjection();
        }
        
        // 3: if no movement, apply friction
        if (!this.keys['KeyW'] &&
            !this.keys['KeyS'] &&
            !this.keys['KeyD'] &&
            !this.keys['KeyA'])
        {
            vec3.scale(c.velocity, c.velocity, 1 - c.friction);
        }

        // 4: limit speed
        const len = vec3.len(c.velocity);
        if (len > c.maxSpeed) {
            vec3.scale(c.velocity, c.velocity, c.maxSpeed / len);
        }
    }

    enable(game, scene) {
        document.addEventListener('mousemove', this.mousemoveHandler);
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
        document.addEventListener('keypress', (e) => this.weaponHandler(e, game));
    }

    disable(game, scene) {
        document.removeEventListener('mousemove', this.mousemoveHandler);
        document.removeEventListener('keydown', this.keydownHandler);
        document.removeEventListener('keyup', this.keyupHandler);
        document.removeEventListener('keypress', (e) => this.weaponHandler(e, game));

        for (let key in this.keys) {
            this.keys[key] = false;
        }
    }

    mousemoveHandler(e) {
        const dx = e.movementX;
        const dy = e.movementY;
        const c = this;

        c.rotation[0] -= dy * c.mouseSensitivity;
        c.rotation[1] -= dx * c.mouseSensitivity;

        const pi = Math.PI;
        const twopi = pi * 2;
        const halfpi = pi / 2;

        if (c.rotation[0] > halfpi) {
            c.rotation[0] = halfpi;
        }
        if (c.rotation[0] < -halfpi) {
            c.rotation[0] = -halfpi;
        }

        c.rotation[1] = ((c.rotation[1] % twopi) + twopi) % twopi;
    }

    keydownHandler(e) {
        this.keys[e.code] = true;
    }

    keyupHandler(e) {
        if (e.code == "Space") {
            this.doubleJumpAvailable = true;
        }
        this.keys[e.code] = false;
    }

    weaponHandler(e, game) {
        if(e.code === 'KeyE') {
            game.scene.nodes.some((node, idx) => {
                if(node instanceof Weapon) {
                    game.camera.addChild(game.weapon);
                    game.scene.nodes.splice(idx, 1);
                    game.weapon.addPhysics(game.scene);
                    // Attack listener is not removed, does not really affect the game.
                    this.attackListener = document.addEventListener('click', (e) => {
                        game.weapon.attack();
                    });
                }
            });

            // * For object transforms
            // this.camera.children[0].translation[1]+=1;
            // this.camera.children[0].updateTransform()
        }
    }

    returnLocation() {
        const c = this;
        return c.translation;
    }

}

Camera.defaults = {
    aspect            : 1,
    fov               : 1.5,
    near              : 0.01,
    far               : 100,
    velocity          : [0, 0, 0],
    mouseSensitivity  : 0.002,
    maxSpeed          : 5,
    friction          : 0.2,
    acceleration      : 40,
    dashCooldown      : 2000,
    maxYCoordinate    : 2
};
