import {Transform} from "$components";
import {Actor} from "$engine";
import {Draw2D} from "$systems";

/** Draws an image on a canvas. */
export class Sprite implements Draw2D {

    private transform: Transform;

    /** Whether to display debugging wireframe. */
    public debug: boolean;

    /** Actor to whom this component belongs. */
    public readonly actor?: Actor;

    /** @inheritDoc */
    public order: number;

    /** Image to draw. */
    public image: HTMLImageElement;

    /** @inheritDoc */
    awake() {
        this.transform = this.actor.require(Transform);
    }

    /** @inheritDoc */
    draw2D(ctx: CanvasRenderingContext2D): void {
        const {image} = this;
        if (!image) return;

        const {position} = this.transform;
        ctx.drawImage(
            image,
            position.x,
            position.y,
        );

        if (this.debug) {
            ctx.strokeRect(
                position.x,
                position.y,
                image.width,
                image.height,
            );
        }
    }
}
