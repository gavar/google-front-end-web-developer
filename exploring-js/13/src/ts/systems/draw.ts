import {CanvasScaler} from "$components";
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

    private readonly root: CanvasScaler;
    private readonly ctx2D: CanvasRenderingContext2D;

    constructor(root: CanvasScaler) {
        super();
        this.root = root;
        this.ctx2D = this.root.canvas.getContext("2d");
        this.ctx2D.imageSmoothingEnabled = false;
        this.ctx2D.oImageSmoothingEnabled = false;
        this.ctx2D.mozImageSmoothingEnabled = false;
        this.ctx2D.webkitImageSmoothingEnabled = false;
    }

    /** @inheritDoc */
    match(component: Draw2D): component is Draw2D {
        return component.draw2D as any;
    }

    /** @inheritDoc */
    protected process(deltaTime: number, compositions: ReadonlyArray<SortComposition<Draw2D>>): void {
        const {ctx2D} = this;
        const {scale} = this.root.transform;
        try {
            ctx2D.save();
            ctx2D.scale(scale.x, scale.y);
            for (const composition of compositions)
                if (composition.component.actor.active)
                    composition.component.draw2D(ctx2D);
        } finally {
            ctx2D.restore();
        }
    }
}
