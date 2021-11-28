import { vec3, mat4 } from '../../lib/gl-matrix-module.js';
import { Camera } from './Camera.js';
import { Collectable } from './Collectable.js';
import { Weapon } from './Weapon.js';

export class Physics {
    constructor(scene) {
        this.scene = scene;
        this.score = 0;
        this.scene.traverse(node => {
            if (node instanceof Camera) {
                this.camera = node;
            }
            if(node.isChalleSale) {
                this.savedSale = node;
            }
        });
        this.isSaved = false;
        this.saleScore = 0;
    }

    update(dt) {
        this.scene.traverse(node => {
            if (node.velocity) {
                vec3.scaleAndAdd(node.translation, node.translation, node.velocity, dt);
                node.updateTransform();
                this.scene.traverse(other => {
                    if (node !== other && !(node instanceof Weapon) && !(other instanceof Weapon)) {
                        this.resolveCollision(node, other);
                    }
                    if(other.isPrisoner && this.saleScore >= 3 && !this.isSaved) {
                        if(this.isColliding(node, other)) {
                            this.isSaved = true;
                            other.translation[0] = -20;
                            other.updateTransform();
                            this.savedSale.translation[0] = [-19.08];
                            this.savedSale.updateTransform();
                            this.gamabuntaHP = 100;
                            console.log(this.gamabuntaHP)
                            document.getElementById("finish-btn").style.display = "block";
                        }
                    }
                });
            }
        });

        this.pickup();

    }

    intervalIntersection(min1, max1, min2, max2) {
        return !(min1 > max2 || min2 > max1);
    }

    aabbIntersection(aabb1, aabb2) {
        return this.intervalIntersection(aabb1.min[0], aabb1.max[0], aabb2.min[0], aabb2.max[0])
            && this.intervalIntersection(aabb1.min[1], aabb1.max[1], aabb2.min[1], aabb2.max[1])
            && this.intervalIntersection(aabb1.min[2], aabb1.max[2], aabb2.min[2], aabb2.max[2]);
    }

    resolveCollision(a, b) {
        // Update bounding boxes with global translation.
        const ta = a.getGlobalTransform();
        const tb = b.getGlobalTransform();

        const posa = mat4.getTranslation(vec3.create(), ta);
        const posb = mat4.getTranslation(vec3.create(), tb);

        const mina = vec3.add(vec3.create(), posa, a.aabb.min);
        const maxa = vec3.add(vec3.create(), posa, a.aabb.max);
        const minb = vec3.add(vec3.create(), posb, b.aabb.min);
        const maxb = vec3.add(vec3.create(), posb, b.aabb.max);

        // Check if there is collision.
        const isColliding = this.aabbIntersection({
            min: mina,
            max: maxa
        }, {
            min: minb,
            max: maxb
        });

        if (!isColliding) {
            return;
        }

        // Move node A minimally to avoid collision.
        const diffa = vec3.sub(vec3.create(), maxb, mina);
        const diffb = vec3.sub(vec3.create(), maxa, minb);

        let minDiff = Infinity;
        let minDirection = [0, 0, 0];
        if (diffa[0] >= 0 && diffa[0] < minDiff) {
            minDiff = diffa[0];
            minDirection = [minDiff, 0, 0];
        }
        if (diffa[1] >= 0 && diffa[1] < minDiff) {
            minDiff = diffa[1];
            minDirection = [0, minDiff, 0];
        }
        if (diffa[2] >= 0 && diffa[2] < minDiff) {
            minDiff = diffa[2];
            minDirection = [0, 0, minDiff];
        }
        if (diffb[0] >= 0 && diffb[0] < minDiff) {
            minDiff = diffb[0];
            minDirection = [-minDiff, 0, 0];
        }
        if (diffb[1] >= 0 && diffb[1] < minDiff) {
            minDiff = diffb[1];
            minDirection = [0, -minDiff, 0];
        }
        if (diffb[2] >= 0 && diffb[2] < minDiff) {
            minDiff = diffb[2];
            minDirection = [0, 0, -minDiff];
        }

        vec3.add(a.translation, a.translation, minDirection);
        a.updateTransform();
    }

    makeInvisible(model) {
        if (model.scale[0] == 0) {
            return;
        }
        model.scale = [0, 0, 0];
        model.updateTransform();
        this.score += 1;
    }

    animateCollectible(model) {
        const x = Math.cos(Date.now() * 0.001);
        model.translation[1] += x / 250;
        model.rotation[1] += 0.01;
        model.updateTransform();
    }

    isColliding(a, b) {
        const ta = a.getGlobalTransform();
        const tb = b.getGlobalTransform();

        const posa = mat4.getTranslation(vec3.create(), ta);
        const posb = mat4.getTranslation(vec3.create(), tb);

        const mina = vec3.add(vec3.create(), posa, a.aabb.min);
        const maxa = vec3.add(vec3.create(), posa, a.aabb.max);
        const minb = vec3.add(vec3.create(), posb, b.aabb.min);
        const maxb = vec3.add(vec3.create(), posb, b.aabb.max);

        const isColliding = this.aabbIntersection({
            min: mina,
            max: maxa
        }, {
            min: minb,
            max: maxb
        });

        return isColliding;
    }

    attack(a) {
        this.scene.traverse(node => {
            if (node !== a && this.isColliding(a, node) && !(node instanceof Camera) && node.isBreakable) {
                this.removeNode(node);
                return;
            }
        });
    }

    pickup() {
        this.scene.traverse(node => {
            if (node instanceof Collectable && this.isColliding(node, this.camera)) {
                this.removeNode(node);
                this.saleScore++;
                document.getElementById("saleScore").innerHTML = this.saleScore;
            }
        });
    }

    removeNode(node) {
        this.scene.nodes.splice(this.scene.nodes.indexOf(node), 1);
    }
}
