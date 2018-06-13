import {Transform, Vector2} from "$components";
import {Actor} from "$engine";
import {Draw2D, Gizmo2D} from "$systems";
import {Mutable} from "@syntax";

/** Draws an image on a canvas. */
export class Sprite implements Draw2D, Gizmo2D {

    private x: number;
    private y: number;

    /** @inheritDoc */
    public readonly actor?: Actor;

    /** Actor's transform. */
    public readonly transform: Transform;

    /** Local offset of the image. */
    public readonly offset: Vector2 = {x: 0, y: 0};

    /** Local pivot of the image. */
    public readonly pivot: Vector2 = {x: 0, y: 0};

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
        this.transform.setScale(x, y);
    }

    /** @inheritDoc */
    awake(this: Mutable<this>) {
        this.transform = this.actor.require(Transform);
    }

    /** @inheritDoc */
    draw2D(ctx: CanvasRenderingContext2D): void {
        const {image} = this;
        if (!image) return;

        this.recalculate();
        const {x, y} = this;
        const {scale} = this.transform;
        const {width, height} = image;

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
        const {image} = this;
        if (!image) return;

        this.recalculate();
        const {x, y} = this;
        const {scale} = this.transform;
        const {width, height} = image;

        try {
            ctx.save();
            ctx.scale(scale.x, scale.y);
            ctx.strokeRect(x, y, width, height);
        }
        finally {
            ctx.restore();
        }
    }

    private recalculate() {
        if (this.image) {
            const {offset, pivot} = this;
            const {position, scale} = this.transform;
            const {width, height} = this.image;

            let x = (position.x + offset.x) / scale.x;
            if (scale.x < 0) x += width * scale.x;
            x += width * pivot.x;
            this.x = x;

            let y = (position.y + offset.y) / scale.y;
            if (scale.y < 0) y += height * scale.y;
            y += height * pivot.y;
            this.y = y;
        }
        else {
            this.x = 0;
            this.y = 0;
        }
    }

}
