import { GUI } from '../../lib/dat.gui.module.js';
import { Application } from '../../common/engine/Application.js';
import { Renderer } from './Renderer.js';
import { Physics } from './Physics.js';
import { Camera } from './Camera.js';
import { SceneLoader } from './SceneLoader.js';
import { SceneBuilder } from './SceneBuilder.js';
import { Weapon } from './Weapon.js';

class App extends Application {

    start() {
        const gl = this.gl;

        this.renderer = new Renderer(gl);
        this.time = Date.now();
        this.startTime = this.time;
        this.aspect = 1;

        this.pointerlockchangeHandler = this.pointerlockchangeHandler.bind(this);
        document.addEventListener('pointerlockchange', this.pointerlockchangeHandler);

        this.load('scene.json');
    }

    async load(uri) {
        const scene = await new SceneLoader().loadScene(uri);
        const builder = new SceneBuilder(scene);
        this.scene = builder.build();
        this.physics = new Physics(this.scene);

        // Find first camera.
        this.camera = null;
        this.scene.traverse(node => {
            if (node instanceof Camera) {
                this.camera = node;
            }
            if(node instanceof Weapon) {
                this.weapon = node;
            }
        });

        // Set weapon as child of camera
        document.addEventListener('keypress', (e) => {
            if(e.code === 'KeyE') {

                this.scene.nodes.some((node, idx) => {
                    if(node instanceof Weapon) {
                        this.camera.addChild(this.weapon);
                        this.scene.nodes.splice(idx);
                        document.addEventListener('click', (e) => {
                            this.weapon.addPhysics(this.scene);
                            this.weapon.animate();
                            this.weapon.attack();
                        })
                    }
                });

                // * For object transforms
                // this.camera.children[0].translation[1]+=1;
                // this.camera.children[0].updateTransform()
            }
        })

        this.camera.aspect = this.aspect;
        this.camera.updateProjection();
        
        this.renderer.prepare(this.scene);
        
        // start the incrementator for stamina
        setInterval(() => {
            if (this.camera.stamina -1 >= 0) {
                this.camera.stamina -= 14;
            }
        }, 10); 
    }

    enableCamera() {
        this.canvas.requestPointerLock();
    }

    pointerlockchangeHandler() {
        if (!this.camera) {
            return;
        }

        if (document.pointerLockElement === this.canvas) {
            this.camera.enable();
        } else {
            this.camera.disable();
        }
    }

    update() {
        const t = this.time = Date.now();
        const dt = (this.time - this.startTime) * 0.001;
        this.startTime = this.time;

        if (this.camera) {
            this.camera.update(dt);
        }

        if (this.physics) {
            this.physics.update(dt);
        }

    }

    render() {
        if (this.scene) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    resize() {
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;
        this.aspect = w / h;
        if (this.camera) {
            this.camera.aspect = this.aspect;
            this.camera.updateProjection();
        }
    }

}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('canvas');
    const app = new App(canvas);
    const gui = new GUI();
    gui.add(app, 'enableCamera');
});
