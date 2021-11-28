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

        this.setAppProperties();

        this.camera.aspect = this.aspect;
        this.camera.updateProjection();
        
        this.renderer.prepare(this.scene);
        
        // start the incrementator for stamina
        setInterval(() => {
            if (this.camera.stamina -1 >= 0) {
                this.camera.stamina -= 15;
            }
        }, 10);

        let startbtn = document.getElementById('startbtn');
        startbtn.addEventListener('click', () => {
            this.enableCamera();
            document.getElementById('startbtn-txt').innerHTML = "Resume";
            new Audio('../common/audio/amogus.mp3').play();
        });
    }

    enableCamera() {
        this.canvas.requestPointerLock();
    }

    pointerlockchangeHandler() {
        if (!this.camera) {
            return;
        }

        if (document.pointerLockElement === this.canvas) {
            this.camera.enable(this);
            document.getElementById('startbtn').classList.add('hidden');
        } else {
            this.camera.disable(this);
            document.getElementById('startbtn').classList.remove('hidden');
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

    setAppProperties() {
        this.camera = null;
        this.scene.traverse(node => {
            if (node instanceof Camera) {
                this.camera = node;
            }
            if(node instanceof Weapon) {
                this.weapon = node;
            }
        });
    }

}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('canvas');
    const app = new App(canvas);
    // const gui = new GUI();
    // gui.add(app, 'enableCamera');
});
