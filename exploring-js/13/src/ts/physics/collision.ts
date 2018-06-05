import {CompositeSystem, Composition} from "$systems";
import {Collider2D} from "./colliders";

export interface CollisionComposition extends Composition<Collider2D> {
    /** Previous intersections.*/
    prev: Collider2D[];
    /** Active intersections. */
    next: Collider2D[];
}

/**
 * System for detecting collisions of 2D colliders.
 */
export class CollisionSystem2D extends CompositeSystem<Collider2D, CollisionComposition> {

    private static readonly buffer = new Set<Collider2D>();

    /** Array of intersection masks for each layer. */
    private readonly masks: number[] = new Array(32);

    /**
     * Configure system to track collision between specified layers (excluding self layer).
     * To enable self layer collision pass value of the layer twice.
     * Layer value should be in range: [0;32)
     */
    enableLayerCollision(...layers: number[]) {
        for (let i = 0; i < layers.length; i++) {
            for (let j = i + 1; j < layers.length; j++) {
                this.masks[layers[i]] |= 1 << layers[j];
                this.masks[layers[j]] |= 1 << layers[i];
            }
        }
    }

    /** @inheritDoc */
    match(component: Collider2D): component is Collider2D {
        return component instanceof Collider2D;
    }

    /** @inheritDoc */
    protected compose(component: Collider2D, index: number): CollisionComposition {
        return {
            component,
            prev: [],
            next: [],
        };
    }

    /** @inheritDoc */
    protected process(deltaTime: number, compositions: ReadonlyArray<CollisionComposition>): void {
        const {masks} = this;

        // recalculate colliders
        for (const composition of compositions) {
            const collider = composition.component;
            collider.gizmo = false;
            if (!collider.actor.active) continue;
            if (!masks[collider.body.layer.value]) continue;
            collider.recalculate();
        }

        // detect collisions
        const size = compositions.length;
        for (let i = 0; i < size; i++) {
            const a = compositions[i];
            const m = masks[a.component.body.layer.value];
            for (let j = i + 1; j < size; j++) {
                const b = compositions[j];
                if (m & b.component.body.layer.mask) {
                    if (a.component.intersect(b.component)) {
                        a.component.gizmo = true;
                        b.component.gizmo = true;
                        a.next.push(b.component);
                    }
                }
            }
        }

        // enter / stay / exit
        for (const composition of compositions) {
            const {buffer} = CollisionSystem2D;
            const {prev, next} = composition;
            const {component} = composition;
            try {
                for (const collider of prev)
                    buffer.add(collider);

                for (const collider of next)
                    if (buffer.delete(collider)) {
                        component.body.stay(collider);
                        collider.body.stay(component);
                    }
                    else {
                        component.body.enter(collider);
                        collider.body.enter(component);
                    }

                for (const collider of prev)
                    if (buffer.delete(collider)) {
                        component.body.exit(collider);
                        collider.body.exit(component);
                    }

            } finally {
                composition.prev = next;
                composition.next = prev;
                composition.next.length = 0;
                buffer.clear(); // should be empty, just for safety
            }
        }
    }
}
