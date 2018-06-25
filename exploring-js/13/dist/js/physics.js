/**
 * Physics body represents a physics unit which may contain multiple colliders.
 */
class PhysicsBody2D {
    /** @inheritDoc */
    awake() {
        this.layer = this.actor.require(Layer);
        this.transform = this.actor.require(Transform);
    }

    /** Trigger entering into collider. */
    enter(collider) {
        for (const component of this.actor.components)
            component.triggerEnter2D &&
            component.triggerEnter2D(collider);
    }

    /** Trigger staying in touch with collider. */
    stay(collider) {
        for (const component of this.actor.components)
            component.triggerStay2D &&
            component.triggerStay2D(collider);
    }

    /** Trigger leaving collider. */
    exit(collider) {
        for (const component of this.actor.components)
            component.triggerExit2D &&
            component.triggerExit2D(collider);
    }
}

/**
 * Base class for primitive collider shapes.
 */
class Collider2D {
    /** @inheritDoc */
    awake() {
        this.body = this.actor.require(PhysicsBody2D);
    }
}

/**
 * Primitive collider of a capsule form.
 * Capsules are boxes with a semi-circle at each end.
 */
class CapsuleCollider2D extends Collider2D {
    constructor() {
        super(...arguments);
        this.min = {x: 0, y: 0};
        this.max = {x: 0, y: 0};
        /** Width and height of the capsule area. */
        this.size = {x: 0, y: 0};
        /** Local pivot of the collider geometry. */
        this.pivot = {x: .5, y: .5};
        /** Local offset of the collider geometry. */
        this.offset = {x: 0, y: 0};
    }

    /** Modify {@link size} values. */
    setSize(x, y) {
        this.size.x = x;
        this.size.y = y;
    }

    /** Modify {@link offset} values. */
    setOffset(x, y) {
        this.offset.x = x;
        this.offset.y = y;
    }

    /** Modify {@link pivot} values. */
    setPivot(x, y) {
        this.pivot.x = x;
        this.pivot.y = y;
    }

    /** @inheritDoc */
    drawGizmo2D(ctx) {
        const {position} = this.body.transform;
        const {size, offset, pivot} = this;
        const x = position.x + offset.x + pivot.x * size.x;
        const y = position.y + offset.y + pivot.y * size.y;
        ctx.strokeStyle = "red";
        Gizmo2D.x(ctx, x, y, 10);
        ctx.strokeStyle = "green";
        Gizmo2D.capsule(ctx, x, y, size.x, size.y);
    }

    /** @inheritDoc */
    recalculate() {
        const {position} = this.body.transform;
        const {size, offset, pivot} = this;
        const d = Math.min(size.x, size.y);
        const dx = (size.x - d) * .5;
        const dy = (size.y - d) * .5;
        this.r = d * .5;
        this.min.x = this.max.x = position.x + offset.x + pivot.x * size.x;
        this.min.y = this.max.y = position.y + offset.y + pivot.y * size.y;
        this.min.x -= dx;
        this.min.y -= dy;
        this.max.x += dx;
        this.max.y += dy;
    }

    /** @inheritDoc */
    intersect(collider) {
        return collider.intersectCapsule(this);
    }

    /** @inheritDoc */
    intersectCapsule(capsule) {
        return Physics2D.intersectCapsuleCapsule(this.min.x, this.min.y, this.max.x, this.max.y, this.r, capsule.min.x, capsule.min.y, capsule.max.x, capsule.max.y, capsule.r);
    }
}

class Physics2D {
    /**
     * Determines whether two capsules intersects.
     * Calculations use capsule center line and its width (radius).
     */
    static intersectCapsuleCapsule(x11, y11, x12, y12, r1, x21, y21, x22, y22, r2) {
        // distance between lines less than sum of radius
        const r = r1 + r2;
        return Physics2D.distanceLineLineSqr(x11, y11, x12, y12, x21, y21, x22, y22) <= r * r;
    }

    /**
     * Calculate square of the shortest distance between two segments.
     */
    static distanceLineLineSqr(x11, y11, x12, y12, x21, y21, x22, y22) {
        // http://geomalgorithms.com/a07-_distance.html
        // https://www.john.geek.nz/2009/03/code-shortest-distance-between-any-two-line-segments/
        const EPSILON = 0.00000001;
        const dx21 = x12 - x11;
        const dy21 = y12 - y11;
        const dx41 = x22 - x21;
        const dy41 = y22 - y21;
        const dx13 = x11 - x21;
        const dy13 = y11 - y21;
        const a = dx21 * dx21 + dy21 * dy21;
        const b = dx21 * dx41 + dy21 * dy41;
        const c = dx41 * dx41 + dy41 * dy41;
        const d = dx21 * dx13 + dy21 * dy13;
        const e = dx41 * dx13 + dy41 * dy13;
        const D = a * c - b * b;
        let sc, sN, sD = D;
        let tc, tN, tD = D;
        if (D < EPSILON) {
            sN = 0.0;
            sD = 1.0;
            tN = e;
            tD = c;
        }
        else {
            sN = (b * e - c * d);
            tN = (a * e - b * d);
            if (sN < 0.0) {
                sN = 0.0;
                tN = e;
                tD = c;
            }
            else if (sN > sD) {
                sN = sD;
                tN = e + b;
                tD = c;
            }
        }
        if (tN < 0) {
            tN = 0;
            if (-d < 0)
                sN = 0;
            else if (-d > a)
                sN = sD;
            else {
                sN = -d;
                sD = a;
            }
        }
        else if (tN > tD) {
            tN = tD;
            if ((-d + b) < 0.0)
                sN = 0;
            else if ((-d + b) > a)
                sN = sD;
            else {
                sN = (-d + b);
                sD = a;
            }
        }
        if (Math.abs(sN) < EPSILON)
            sc = 0.0;
        else
            sc = sN / sD;
        if (Math.abs(tN) < EPSILON)
            tc = 0.0;
        else
            tc = tN / tD;
        const dx = dx13 + (sc * dx21) - (tc * dx41);
        const dy = dy13 + (sc * dy21) - (tc * dy41);
        return dx * dx + dy * dy;
    }
}

/**
 * System for detecting collisions of 2D colliders.
 */
class CollisionSystem2D extends CompositeSystem {
    constructor() {
        super(...arguments);
        /** Array of intersection masks for each layer. */
        this.masks = new Array(32);
    }

    static isActive(component, body, masks) {
        return body.enabled // physics body enabled
            && component.enabled // collider enabled
            && !!masks[body.layer.value] // has collision with any other layer
            ;
    }

    static invoke(key, self, pair, masks) {
        const {isActive} = CollisionSystem2D;
        self.component.body[key](pair.component);
        pair.component.body[key](self.component);
        self.active = self.active && isActive(self.component, self.component.body, masks);
        pair.active = pair.active && isActive(pair.component, pair.component.body, masks);
    }

    /**
     * Configure system to track collision between specified layers (excluding self layer).
     * To enable self layer collision pass value of the layer twice.
     * Layer value should be in range: [0;32)
     */
    enableLayerCollision(...layers) {
        for (let i = 0; i < layers.length; i++) {
            for (let j = i + 1; j < layers.length; j++) {
                this.masks[layers[i]] |= 1 << layers[j];
                this.masks[layers[j]] |= 1 << layers[i];
            }
        }
    }

    /** @inheritDoc */
    match(component) {
        return component instanceof Collider2D;
    }

    /** @inheritDoc */
    compose(component, index) {
        return {
            component,
            prev: [],
            next: [],
        };
    }

    /** @inheritDoc */
    process(deltaTime, compositions) {
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
            if (!self.active)
                continue;
            const m = masks[self.component.body.layer.value];
            for (let j = i + 1; j < size; j++) {
                const pair = compositions[j];
                if (!pair.active)
                    continue;
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
                        next[i] = false;
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

CollisionSystem2D.buffer = new Set();
