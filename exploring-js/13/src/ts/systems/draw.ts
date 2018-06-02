import {Sortable, SortSystem} from "$systems";

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

    private readonly canvas: HTMLCanvasElement;
    private readonly context2D: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement) {
        super();
        this.canvas = canvas;
        this.context2D = this.canvas.getContext("2d");
    }

    /** @inheritDoc */
    match(component: Draw2D): component is Draw2D {
        return component.draw2D as any;
    }

    /** @inheritDoc */
    protected process(deltaTime: number, components: ReadonlyArray<Draw2D>): void {
        const ctx2D = this.context2D;
        for (const component of components)
            if (component.actor.active)
                component.draw2D(ctx2D);
    }
}
