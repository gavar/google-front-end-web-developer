import {System} from "$engine";

export interface Draw2D {
    draw2D(ctx: CanvasRenderingContext2D): void
}

/**
 * System which draws components on a canvas.
 */
export class DrawSystem extends System<Draw2D> {
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
            component.draw2D(ctx2D);
    }
}
