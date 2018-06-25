/**
 * Base class for which require to work with multiple components at the same time.
 */
class CompositeSystem {
    constructor() {
        this.compositions = [];
        this.indexer = new Map();
    }
    /** @inheritDoc */
    add(component) {
        if (this.indexer.has(component))
            return;
        const index = this.compositions.length;
        const composition = this.compose(component, index);
        this.indexer.set(composition.component, index);
        this.compositions.push(composition);
    }
    /** @inheritDoc */
    remove(component) {
        const { indexer } = this;
        const index = indexer.get(component);
        if (typeof index === "undefined")
            return;
        // remove from indexer
        indexer.delete(component);
        // fill empty slot with last component
        const { compositions } = this;
        if (Bag.removeAt(compositions, index))
            indexer.set(compositions[index].component, index);
    }
    /** @inheritDoc */
    tick(deltaTime) {
        this.process(deltaTime, this.compositions);
    }
}

/**
 * Base class for systems that require to process components in proper sorting order.
 */
class SortSystem extends CompositeSystem {
    /** @inheritDoc */
    tick(deltaTime) {
        // sort components
        const { compositions } = this;
        compositions.sort(this.compare);
        // prepare
        for (let i = 0, size = this.compositions.length; i < size; i++) {
            const composition = compositions[i];
            // update order if changed while sort
            if (composition.index !== i) {
                composition.index = i;
                this.indexer.set(composition.component, i);
            }
        }
        // process
        this.process(deltaTime, compositions);
    }
    /** Compare two entries by sorting layer, order and z-index. */
    compare(a, b) {
        return a.layer.value - b.layer.value
            || ~b.component.order - ~a.component.order
            || a.index - b.index;
    }
    /** @inheritDoc */
    compose(component, index) {
        return {
            index,
            component,
            layer: component.actor.require(Layer),
        };
    }
}

/**
 * System which draws components on a canvas.
 */
class DrawSystem extends SortSystem {
    constructor(canvas) {
        super();
        this.canvas = canvas;
        this.ctx2D = canvas.element.getContext("2d");
        this.ctx2D.imageSmoothingEnabled = false;
        this.ctx2D.oImageSmoothingEnabled = false;
        this.ctx2D.mozImageSmoothingEnabled = false;
        this.ctx2D.webkitImageSmoothingEnabled = false;
    }
    /** @inheritDoc */
    match(component) {
        return !!component.draw2D;
    }
    /** @inheritDoc */
    process(deltaTime, compositions) {
        const { ctx2D } = this;
        const { scale } = this.canvas.transform;
        try {
            ctx2D.save();
            ctx2D.scale(scale.x, scale.y);
            Canvas.active = this.canvas;
            for (const composition of compositions) {
                const { component } = composition;
                if (component.enabled && component.actor.active)
                    component.draw2D(ctx2D, deltaTime);
            }
        }
        finally {
            Canvas.active = null;
            ctx2D.restore();
        }
    }
}

/**
 * System which invokes 'update' on a component.
 */
class UpdateSystem extends ComponentSystem {
    /** @inheritDoc */
    match(component) {
        return !!component.update;
    }
    /** @inheritDoc */
    process(deltaTime, components) {
        for (const component of components)
            if (component.enabled && component.actor.active)
                component.update(deltaTime);
    }
}

/**
 * System which invokes 'update' on a component.
 */
class LateUpdateSystem extends ComponentSystem {
    /** @inheritDoc */
    match(component) {
        return !!component.lateUpdate;
    }
    /** @inheritDoc */
    process(deltaTime, components) {
        for (const component of components)
            if (component.enabled && component.actor.active)
                component.lateUpdate(deltaTime);
    }
}

class Gizmo2D {
    /** Draw 'x' symbol. */
    static x(ctx, x, y, size = 2) {
        const half = size * .5;
        ctx.beginPath();
        ctx.moveTo(x - half, y - half);
        ctx.lineTo(x + half, y + half);
        ctx.moveTo(x - half, y + half);
        ctx.lineTo(x + half, y - half);
        ctx.stroke();
    }
    /** Draw capsule wireframe. */
    static capsule(ctx, x, y, w, h) {
        ctx.beginPath();
        if (h > w) {
            const r = w * .5;
            const dy = (h - w) * .5;
            ctx.beginPath();
            ctx.arc(x, y - dy, r, Math.PI, 0, false);
            ctx.arc(x, y + dy, r, 0, Math.PI, false);
            ctx.closePath();
        }
        else {
            const r = h * .5;
            const dx = (w - h) * .5;
            ctx.beginPath();
            ctx.arc(x - dx, y, r, Math.PI * 1.5, Math.PI * .5, true);
            ctx.arc(x + dx, y, r, Math.PI * .5, Math.PI * 1.5, true);
            ctx.closePath();
        }
        ctx.stroke();
    }
}
/**
 * System for drawing debug gizmos.
 */
class GizmoSystem extends SortSystem {
    constructor(canvas) {
        super();
        this.canvas = canvas;
        this.ctx2D = canvas.element.getContext("2d");
        this.ctx2D.imageSmoothingEnabled = false;
        this.ctx2D.oImageSmoothingEnabled = false;
        this.ctx2D.mozImageSmoothingEnabled = false;
        this.ctx2D.webkitImageSmoothingEnabled = false;
    }
    /** @inheritDoc */
    match(component) {
        return !!component.drawGizmo2D;
    }
    /** @inheritDoc */
    process(deltaTime, compositions) {
        const { ctx2D } = this;
        const { scale } = this.canvas.transform;
        try {
            ctx2D.save();
            ctx2D.scale(scale.x, scale.y);
            Canvas.active = this.canvas;
            for (const composition of compositions) {
                const { component } = composition;
                if (component.gizmo && component.enabled && component.actor.active)
                    component.drawGizmo2D(ctx2D);
            }
        }
        finally {
            Canvas.active = null;
            ctx2D.restore();
        }
    }
}
