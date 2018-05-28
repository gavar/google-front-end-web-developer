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
