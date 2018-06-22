import {Canvas, Layer} from "$/components";
import {Actor} from "$/engine";
import {Draw2D} from "$/systems";

export class FPS implements Draw2D {

    /** @inheritDoc */
    readonly actor?: Actor;

    /** @inheritDoc */
    awake() {
        this.actor.require(Layer).set(10000);
    }

    /** @inheritDoc */
    draw2D(ctx: CanvasRenderingContext2D, deltaTime: number): void {
        const {scale} = Canvas.active.transform;
        const fps = Math.ceil(1 / deltaTime).toFixed(0);
        try {
            ctx.save();
            ctx.font = "20px serif";
            ctx.fillStyle = "white";
            ctx.scale(1 / scale.x, 1 / scale.y);
            ctx.translate(ctx.canvas.width - 22, ctx.canvas.height - 5);
            ctx.fillText(fps, 0, 0);
        }
        finally {
            ctx.restore();
        }
    }
}
