import {Canvas} from "$components";
import {Sortable, SortComposition, SortSystem} from "$systems";

export interface Draw2D extends Sortable {
    /**
     * Render component on a given 2D context.
     * @param ctx - 2D canvas rendering context to render on.
     */
    draw2D(ctx: CanvasRenderingContext2D): void
}

/**
 * System which draws components on a canvas.
 */
export class DrawSystem extends SortSystem<Draw2D> {

    private readonly canvas: Canvas;
    private readonly ctx2D: CanvasRenderingContext2D;

    constructor(canvas: Canvas) {
        super();
        this.canvas = canvas;
        this.ctx2D = canvas.element.getContext("2d");
        this.ctx2D.imageSmoothingEnabled = false;
        this.ctx2D.oImageSmoothingEnabled = false;
        this.ctx2D.mozImageSmoothingEnabled = false;
        this.ctx2D.webkitImageSmoothingEnabled = false;
    }

    /** @inheritDoc */
    match(component: Draw2D): component is Draw2D {
        return !!component.draw2D;
    }

    /** @inheritDoc */
    protected process(deltaTime: number, compositions: ReadonlyArray<SortComposition<Draw2D>>): void {
        const {ctx2D} = this;
        const {scale} = this.canvas.transform;
        try {
            ctx2D.save();
            ctx2D.scale(scale.x, scale.y);
            for (const composition of compositions) {
                const {component} = composition;
                if (component.enabled && component.actor.active)
                    component.draw2D(ctx2D);
            }
        } finally {
            ctx2D.restore();
        }
    }
}
