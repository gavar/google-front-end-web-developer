import {Transform, Vector2} from "$components";
import {Actor, Component} from "$engine";
import {LateUpdate} from "$systems";
import {Mutable} from "@syntax";

/**
 * Component containing canvas, scaling it to fit the screen.
 */
export class Canvas implements Component, LateUpdate {

    /** @inheritDoc */
    public readonly actor: Actor;

    /** Actor's transform. */
    public readonly transform: Transform;

    /** How much units canvas has by 'X' and 'Y'. */
    public readonly size: Vector2 = {x: 0, y: 0};

    /** Canvas HTML element. */
    public element: HTMLCanvasElement;

    /** @inheritDoc */
    awake(this: Mutable<this>) {
        this.transform = this.actor.require(Transform);
    }

    /** @inheritDoc */
    lateUpdate(deltaTime: number): void {
        const {scale} = this.transform;
        const {size, element} = this;
        // scale down canvas to fit the screen
        const x = (window.innerWidth) / size.x;
        const y = (window.innerHeight) / size.y;
        scale.x = scale.y = Math.min(x, y, 1);
        element.width = size.x * scale.x;
        element.height = size.y * scale.y;
    }
}
