import {PhysicsBody2D} from "$/physics";
import {CompositeSystem, Composition} from "$/systems";
import {Collider2D} from "./colliders";

export interface CollisionComposition extends Composition<Collider2D> {
    /** Previous intersections.*/
    prev: CollisionComposition[];
    /** Active intersections. */
    next: CollisionComposition[];
    /** Whether this collider can participate in collisions. */
    active?: boolean;
}

/**
 * System for detecting collisions of 2D colliders.
 */
export class CollisionSystem2D extends CompositeSystem<Collider2D, CollisionComposition> {

    private static readonly buffer = new Set<CollisionComposition>();

    private static isActive(component: Collider2D, body: PhysicsBody2D, masks: number[]) {
        return body.enabled  // physics body enabled
            && component.enabled // collider enabled
            && !!masks[body.layer.value] // has collision with any other layer
            ;
    }

    private static invoke<K extends "enter" | "stay" | "exit">(key: K, self: CollisionComposition, pair: CollisionComposition, masks: number[]) {
        const {isActive} = CollisionSystem2D;
        self.component.body[key](pair.component);
        pair.component.body[key](self.component);
        self.active = self.active && isActive(self.component, self.component.body, masks);
        pair.active = pair.active && isActive(pair.component, pair.component.body, masks);
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
        const {buffer, isActive, invoke} = CollisionSystem2D;
        const {masks} = this;

        // update state
        for (const self of compositions) {
            const {component} = self;
            self.active = isActive(component, component.body, masks);
            self.active && component.recalculate();
        }

        // detect collisions
        const size = compositions.length;
        for (let i = 0; i < size; i++) {
            const self = compositions[i];
            if (!self.active) continue;
            const m = masks[self.component.body.layer.value];
            for (let j = i + 1; j < size; j++) {
                const pair = compositions[j];
                if (!pair.active) continue;
                if (m & pair.component.body.layer.mask)
                    if (self.component.intersect(pair.component))
                        self.next.push(pair);
            }
        }

        // enter / stay / exit
        for (const self of compositions) {
            const {prev, next} = self;
            try {
                // fill buffer with previous collisions
                for (const collider of prev)
                    buffer.add(collider);

                // process new collisions
                for (let i = 0; i < next.length && self.active; i++) {
                    const pair = next[i];
                    if (pair && pair.active)
                        invoke(buffer.has(pair) ? "stay" : "enter", self, pair, masks);

                    if (self.active && pair && pair.active) {
                        // remove from 'prev' buffer since it should go to 'next'
                        buffer.delete(pair);
                    }
                    else {
                        // schedule 'exit' call if self deactivated or collider disabled
                        next[i] = false as any;
                        pair && prev.push(pair);
                    }
                }

                // exit from previous
                for (const pair of prev)
                    if (buffer.delete(pair))
                        invoke("exit", self, pair, masks);

                // exit from 'next' if has been this frame
                if (!self.active) {
                    for (const pair of next)
                        pair && invoke("exit", self, pair, masks);

                    // you shall not pass to 'prev'
                    next.length = 0;
                }

                if (buffer.size > 0)
                    throw new Error("collision system invalid state");
            }
            finally {
                prev.length = 0;

                // filter out deleted items
                for (const pair of next)
                    pair && prev.push(pair);

                next.length = 0;
                buffer.clear();
            }
        }

        // show gizmo?
        if (this.gizmo) {
            // disable all gizmos
            for (const item of compositions)
                item.component.gizmo = false;

            // enable gizmos on collisions
            for (const item of compositions)
                for (const pair of item.prev)
                    item.component.gizmo = pair.component.gizmo = true;
        }
    }
}
