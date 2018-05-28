import {Actor, Component} from "$engine";
import {Draw2D} from "$systems";
import {Transform} from "./transform";

/** Draws an image on a canvas. */
export class Sprite implements Component, Draw2D {

    private transform: Transform;

    /** @inheritDoc */
    readonly actor: Actor;

    /** Whether to display debugging wireframe. */
    public debug: boolean;

    /** Image to draw. */
    public image: HTMLImageElement;

    /** @inheritDoc */
    awake() {
        this.transform = this.actor.require(Transform);
    }

    /** @inheritDoc */
    draw2D(ctx: CanvasRenderingContext2D): void {
        if (!this.image)
            return;

        ctx.drawImage(
            this.image,
            this.transform.position.x,
            this.transform.position.y,
        );

        if (this.debug) {
            ctx.strokeRect(
                this.transform.position.x,
                this.transform.position.y,
                this.image.width,
                this.image.height,
            );
        }
    }
}
