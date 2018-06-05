import {Transform} from "$components";
import {Actor} from "$engine";
import {Draw2D, Gizmo2D} from "$systems";
import {Mutable} from "@syntax";

/** Draws an image on a canvas. */
export class Sprite implements Draw2D, Gizmo2D {

    /** @inheritDoc */
    public readonly actor?: Actor;

    /** Actor's transform. */
    public readonly transform: Transform;

    /** @inheritDoc */
    public gizmo: boolean;

    /** @inheritDoc */
    public order: number;

    /** Image to draw. */
    public image: HTMLImageElement;

    /** @inheritDoc */
    awake(this: Mutable<this>) {
        this.transform = this.actor.require(Transform);
    }

    /** @inheritDoc */
    draw2D(ctx: CanvasRenderingContext2D): void {
        const {image} = this;
        if (image) {
            const {position} = this.transform;
            ctx.drawImage(
                image,
                position.x,
                position.y,
            );
        }
    }

    /** @inheritDoc */
    drawGizmo2D(ctx: CanvasRenderingContext2D): void {
        const {position} = this.transform;
        const {image} = this;
        ctx.strokeRect(
            position.x,
            position.y,
            image.width || 1,
            image.height || 1,
        );
    }
}
