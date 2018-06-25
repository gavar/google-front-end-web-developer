import {Transform, Vector2} from "$/components";
import {Actor} from "$/engine";
import {Draw2D, Gizmo2D} from "$/systems";
import {Mutable} from "@syntax";

/** Draws an image on a canvas. */
export class Sprite implements Draw2D, Gizmo2D {

    /** @inheritDoc */
    public readonly actor?: Actor;

    /** Actor's transform. */
    public readonly transform: Transform;

    /** Additional translation to transform coordinates. */
    public readonly translate: Vector2 = {x: 0, y: 0};

    /** Defines origin offset from the transform position multiplied by image size. */
    public readonly offset: Vector2 = {x: 0, y: 0};

    /** Rotation pivot of the image. */
    public readonly pivot: Vector2 = {x: .5, y: .5};

    /**
     * Canvas filter to apply.
     * Experimental feature, may not work in all browsers.
     */
    public filter: string;

    /** Opacity of the image. */
    public opacity: number = 1;

    /** @inheritDoc */
    public gizmo: boolean;

    /** @inheritDoc */
    public order: number;

    /** Image to draw. */
    public image: HTMLImageElement;

    /** Set value of {@link pivot}. */
    setPivot(x: number, y: number) {
        this.pivot.x = x;
        this.pivot.y = y;
    }

    /** Set value of {@link scale}. */
    setScale(x: number, y: number) {
        this.transform.setScale(x, y);
    }

    /** Set value of {@link offset}. */
    setOffset(x: number, y: number) {
        this.offset.x = x;
        this.offset.y = y;
    }

    /**
     * X point of the sprite OOBB.
     * @param pivot - pivot point of the image, defaults to {@link pivot}.
     */
    x(pivot?: number) {
        if (arguments.length < 1)
            pivot = this.pivot.x;

        const {image} = this;
        const {offset, translate} = this;
        const {position, rotation, scale} = this.transform;
        const size = (image && image.width || 0) * Math.abs(scale.x);

        // TODO: consider rotation
        return position.x
            + translate.x
            + offset.x * size
            + pivot * size
            ;
    }

    /**
     * Y point of the sprite OOBB.
     * @param pivot - pivot point of the image, defaults to {@link pivot}.
     */
    y(pivot?: number) {
        if (arguments.length < 1)
            pivot = this.pivot.y;

        const {image} = this;
        const {offset, translate} = this;
        const {position, rotation, scale} = this.transform;
        const size = (image && image.height || 0) * Math.abs(scale.y);

        // TODO: consider rotation
        return position.y
            + translate.y
            + offset.y * size
            + pivot * size
            ;
    }

    /** @inheritDoc */
    awake(this: Mutable<this>) {
        this.transform = this.actor.require(Transform);
    }

    /** @inheritDoc */
    draw2D(ctx: CanvasRenderingContext2D): void {
        const {image} = this;
        if (!image) return;

        const {offset, translate, pivot, opacity, filter} = this;
        const {position, rotation, scale} = this.transform;
        const {width, height} = image;

        const w = width * Math.abs(scale.x);
        const h = height * Math.abs(scale.y);

        try {
            ctx.save();
            (ctx as any).filter = filter;
            ctx.globalAlpha = opacity;
            ctx.translate(position.x, position.y);
            ctx.translate(translate.x, translate.y);
            ctx.translate(offset.x * width, offset.y * height);
            const dx = pivot.x * w;
            const dy = pivot.y * h;
            ctx.translate(dx, dy);
            ctx.rotate(rotation.z * Math.PI / 180);
            ctx.scale(scale.x >= 0 ? 1 : -1, scale.y >= 0 ? 1 : -1);
            ctx.drawImage(image, -dx, -dy, w, h);
        }
        finally {
            ctx.restore();
        }
    }

    /** @inheritDoc */
    drawGizmo2D(ctx: CanvasRenderingContext2D): void {
        const {image} = this;
        if (image) {
            this.drawOOBB(ctx, image);
        }
    }

    /**
     * Draw image as object oriented bounding box (OOBB).
     */
    private drawOOBB(ctx: CanvasRenderingContext2D, image: HTMLImageElement): void {
        const {translate, offset, pivot} = this;
        const {position, rotation, scale} = this.transform;
        const {width, height} = image;

        const w = width * Math.abs(scale.x);
        const h = height * Math.abs(scale.y);

        try {
            ctx.save();

            // position point
            ctx.translate(position.x, position.y);
            ctx.translate(translate.x, translate.y);
            ctx.strokeStyle = "black";
            Gizmo2D.x(ctx, 0, 0, 10);

            // origin point
            ctx.translate(offset.x * width, offset.y * height);

            // pivot point
            const dx = pivot.x * w;
            const dy = pivot.y * h;
            ctx.translate(dx, dy);
            ctx.strokeStyle = "blue";
            Gizmo2D.x(ctx, 0, 0, 10);
            ctx.rotate(rotation.z * Math.PI / 180);

            // object oriented bounding box
            ctx.strokeStyle = "red";
            ctx.scale(scale.x >= 0 ? 1 : -1, scale.y >= 0 ? 1 : -1);
            ctx.strokeRect(-dx, -dy, w, h);
        }
        finally {
            ctx.restore();
        }
    }
}
