import {PhysicsBody2D} from "$physics";
import {CompositeSystem, Composition} from "$systems";
import {Collider2D} from "./colliders";

export interface CollisionComposition extends Composition<Collider2D> {
    /** Previous intersections.*/
    prev: Collider2D[];
    /** Active intersections. */
    next: Collider2D[];
    /** Whether this collider can participate in collisions. */
    active?: boolean;
}

/**
 * System for detecting collisions of 2D colliders.
 */
export class CollisionSystem2D extends CompositeSystem<Collider2D, CollisionComposition> {

    private static readonly buffer = new Set<Collider2D>();

    private static isActive(component: Collider2D, body: PhysicsBody2D, masks: number[]) {
        return body.enabled  // physics body enabled
            && component.enabled // collider enabled
            && masks[body.layer.value] as any // has collision with any other layer
            ;
    }

    /** Array of intersection masks for each layer. */
    private readonly masks: number[] = new Array(32);

    /** Whether to show intersected colliders gizmos. */
    public gizmo: boolean;

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
        const {isActive} = CollisionSystem2D;
        const {masks} = this;

        // recalculate colliders
        for (const item of compositions) {
            const {component} = item;
            // check if active
            item.active = isActive(component, component.body, masks);
            // recalculate
            if (item.active)
                component.recalculate();
        }

        // detect collisions
        const size = compositions.length;
        for (let i = 0; i < size; i++) {
            const a = compositions[i];
            if (!a.active) continue;
            const m = masks[a.component.body.layer.value];
            for (let j = i + 1; j < size; j++) {
                const b = compositions[j];
                if (!a.active) continue;
                if (m & b.component.body.layer.mask)
                    if (a.component.intersect(b.component))
                        a.next.push(b.component);
            }
        }

        // enter / stay / exit
        for (const item of compositions) {
            const {buffer} = CollisionSystem2D;
            const {prev, next, component} = item;
            try {
                for (const collider of prev)
                    buffer.add(collider);

                for (let i = 0; i < next.length; i++) {
                    const collider = next[i];
                    const stay = buffer.delete(collider);

                    // stay / enter
                    if (stay) component.body.stay(collider);
                    else component.body.enter(collider);

                    // self disable / destroy after callback?
                    item.active = isActive(component, component.body, masks);
                    if (!item.active)
                        break;

                    // collider disable / destroy?
                    if (!isActive(collider, collider.body, masks)) {
                        const last = next.pop();
                        if (i < next.length)
                            next[i--] = last;

                        prev.push(collider);
                        buffer.add(collider);
                    }
                }

                if (item.active) {
                    // exit from previous
                    for (const collider of prev) {
                        if (buffer.delete(collider)) {
                            component.body.exit(collider);
                            collider.body.exit(component);
                        }
                    }
                }
                else {
                    // exit from all if deactivated
                    for (const collider of prev) {
                        component.body.exit(collider);
                        collider.body.exit(component);
                    }
                    for (const collider of next) {
                        component.body.exit(collider);
                        collider.body.exit(component);
                    }
                    prev.length = 0;
                    next.length = 0;
                }
            }
            finally {
                item.prev = next;
                item.next = prev;
                item.next.length = 0;
                buffer.clear();
            }
        }

        // show gizmo?
        if (this.gizmo) {
            // disable all gizmos
            for (const item of compositions)
                item.component.gizmo = false;

            // enable gizmos on collisions
            for (const item of compositions) {
                for (const collider of item.prev)
                    item.component.gizmo = collider.gizmo = true;
            }
        }
    }
}
