import {Sortable, SortSystem} from "$systems";

export interface Gizmo2D extends Sortable {

    /** Whether to draw debug geometry. */
    gizmo?: boolean;

    /**
     * Render component gizmos on a given 2D context.
     * @param ctx - 2D canvas rendering context to render on.
     */
    drawGizmo2D(ctx: CanvasRenderingContext2D): void
}

export namespace Gizmo2D {

    /** Draw 'x' symbol. */
    export function x(ctx: CanvasRenderingContext2D, x: number, y: number, size: number = 2) {
        const half = size * .5;
        ctx.beginPath();
        ctx.moveTo(x - half, y - half);
        ctx.lineTo(x + half, y + half);
        ctx.moveTo(x - half, y + half);
        ctx.lineTo(x + half, y - half);
        ctx.stroke();
    }

    /** Draw capsule wireframe. */
    export function capsule(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
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
export class GizmoSystem extends SortSystem<Gizmo2D> {

    private readonly canvas: HTMLCanvasElement;
    private readonly context2D: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement) {
        super();
        this.canvas = canvas;
        this.context2D = this.canvas.getContext("2d");
    }

    /** @inheritDoc */
    match(component: Gizmo2D): component is Gizmo2D {
        return component.drawGizmo2D as any;
    }

    /** @inheritDoc */
    protected process(deltaTime: number, components: ReadonlyArray<Gizmo2D>): void {
        const ctx2D = this.context2D;
        for (const component of components)
            if (component.gizmo && component.actor.active)
                component.drawGizmo2D(ctx2D);
    }
}
