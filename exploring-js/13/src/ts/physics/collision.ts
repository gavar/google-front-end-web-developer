import {ComponentSystem} from "$engine";
import {Collider2D} from "./colliders";

/**
 * System for detecting collisions of 2D colliders.
 */
export class CollisionSystem2D extends ComponentSystem<Collider2D> {

    /** Array of intersection masks for each layer. */
    private readonly masks: number[] = new Array(32);

    /**
     * Configure system to track intersection of the given layers.
     * Layer value should be in range: [0;32)
     */
    enableIntersectionOf(layer1: number, layer2: number) {
        this.masks[layer1] |= 1 << layer2;
        this.masks[layer2] |= 1 << layer1;
    }

    /** @inheritDoc */
    match(component: Collider2D): component is Collider2D {
        return component instanceof Collider2D;
    }

    /** @inheritDoc */
    protected process(deltaTime: number, components: ReadonlyArray<Collider2D>): void {
        const {masks} = this;

        // filter & recalculate
        for (const component of components) {
            component.gizmo = false;
            if (!component.actor.active) continue;
            if (!masks[component.body.layer.value]) continue;
            component.recalculate();
        }

        // detect collisions
        const size = components.length;
        for (let i = 0; i < size; i++) {
            const a = components[i];
            const mask = masks[a.body.layer.value];
            for (let j = i + 1; j < size; j++) {
                const b = components[j];
                if (mask & b.body.layer.mask) {
                    if (a.intersect(b)) {
                        a.gizmo = true;
                        b.gizmo = true;
                    }
                }
            }
        }
    }
}
