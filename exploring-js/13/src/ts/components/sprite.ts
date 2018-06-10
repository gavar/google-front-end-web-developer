import {Transform, Vector2} from "$components";
import {Actor} from "$engine";
import {Draw2D, Gizmo2D} from "$systems";
import {Mutable} from "@syntax";

/** Draws an image on a canvas. */
export class Sprite implements Draw2D, Gizmo2D {

    /** @inheritDoc */
    public readonly actor?: Actor;

    /** Actor's transform. */
    public readonly transform: Transform;

    /** Image rendering offset. */
    public readonly offset: Vector2 = {x: 0, y: 0};

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
        const {image, offset} = this;
        if (image) {
            const {position} = this.transform;
            ctx.drawImage(
                image,
                position.x + offset.x,
                position.y + offset.y,
            );
        }
    }

    /** @inheritDoc */
    drawGizmo2D(ctx: CanvasRenderingContext2D): void {
        const {image, offset} = this;
        const {position} = this.transform;
        ctx.strokeRect(
            position.x + offset.x,
            position.y + offset.y,
            image.width || 1,
            image.height || 1,
        );
    }
}
