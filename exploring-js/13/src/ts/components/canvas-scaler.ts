import {Transform, Vector2} from "$components";
import {Actor, Component} from "$engine";
import {LateUpdate} from "$systems";
import {Mutable} from "@syntax";

export class CanvasScaler implements Component, LateUpdate {

    /** @inheritDoc */
    public readonly actor: Actor;

    /** Actor's transform. */
    public readonly transform: Transform;

    public readonly size: Vector2 = {x: 0, y: 0};
    public readonly padding: Vector2 = {x: 0, y: 0};
    public canvas: HTMLCanvasElement;

    /** @inheritDoc */
    awake(this: Mutable<this>) {
        this.transform = this.actor.require(Transform);
    }

    /** @inheritDoc */
    lateUpdate(deltaTime: number): void {
        const {scale} = this.transform;
        const {size, padding, canvas} = this;
        const x = (window.innerWidth - padding.x) / size.x;
        const y = (window.innerHeight - padding.y) / size.y;
        scale.x = scale.y = Math.min(x, y, 1);
        canvas.width = size.x * scale.x;
        canvas.height = size.y * scale.y;
    }
}
