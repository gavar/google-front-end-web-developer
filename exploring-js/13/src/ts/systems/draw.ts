import {Vector2} from "$components";
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

    private readonly scale: Readonly<Vector2>;
    private readonly canvas: HTMLCanvasElement;
    private readonly context2D: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement, scale: Readonly<Vector2> = Vector2.one) {
        super();
        this.scale = scale;
        this.canvas = canvas;
        this.context2D = this.canvas.getContext("2d");
        this.context2D.imageSmoothingEnabled = false;
        this.context2D.oImageSmoothingEnabled = false;
        this.context2D.mozImageSmoothingEnabled = false;
        this.context2D.webkitImageSmoothingEnabled = false;
    }

    /** @inheritDoc */
    match(component: Draw2D): component is Draw2D {
        return component.draw2D as any;
    }

    /** @inheritDoc */
    protected process(deltaTime: number, compositions: ReadonlyArray<SortComposition<Draw2D>>): void {
        const ctx2D = this.context2D;
        ctx2D.scale(this.scale.x, this.scale.y);
        for (const composition of compositions)
            if (composition.component.actor.active)
                composition.component.draw2D(ctx2D);
    }
}
