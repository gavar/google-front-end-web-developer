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

    /** Local offset of the image. */
    public readonly offset: Vector2 = {x: 0, y: 0};

    /** Local pivot of the image. */
    public readonly pivot: Vector2 = {x: 0, y: 0};

    /** Local scale of the image. */
    public readonly scale: Vector2 = {x: 1, y: 1};

    /** @inheritDoc */
    public gizmo: boolean;

    /** @inheritDoc */
    public order: number;

    /** Image to draw. */
    public image: HTMLImageElement;

    /** Set value of {@link offset}. */
    setOffset(x: number, y: number) {
        this.offset.x = x;
        this.offset.y = y;
    }

    /** Set value of {@link pivot}. */
    setPivot(x: number, y: number) {
        this.pivot.x = x;
        this.pivot.y = y;
    }

    /** Set value of {@link scale}. */
    setScale(x: number, y: number) {
        this.scale.x = x;
        this.scale.y = y;
    }

    /** @inheritDoc */
    awake(this: Mutable<this>) {
        this.transform = this.actor.require(Transform);
    }

    /** @inheritDoc */
    draw2D(ctx: CanvasRenderingContext2D): void {
        const {image} = this;
        if (!image) return;

        const {scale, offset, pivot} = this;
        const {position} = this.transform;
        const {width, height} = image;

        let x = (position.x + offset.x) / scale.x;
        if (scale.x < 0) x += width * scale.x;
        x += width * pivot.x;

        let y = (position.y + offset.y) / scale.y;
        if (scale.y < 0) y += height * scale.y;
        y += height * pivot.y;

        try {
            ctx.save();
            ctx.scale(scale.x, scale.y);
            ctx.drawImage(image, x, y, width, height);
        }
        finally {
            ctx.restore();
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
