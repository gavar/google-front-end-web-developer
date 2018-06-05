import {Transform, Vector2} from "$components";
import {Actor, Component} from "$engine";
import {Update} from "$systems";
import {Mutable} from "@syntax";

/**
 * Moves transform by given velocity.
 */
export class Motor implements Component, Update {

    /** @inheritDoc */
    public readonly actor: Actor;

    /** Velocity vector of the motor. */
    public readonly velocity: Vector2 = {x: 0, y: 0};

    /** Transform to move by this motor. */
    public readonly transform: Transform;

    /** @inheritDoc */
    awake(this: Mutable<this>) {
        this.transform = this.actor.require(Transform);
    }

    /** @inheritDoc */
    update(deltaTime: number): void {
        this.transform.position.x += this.velocity.x * deltaTime;
        this.transform.position.y += this.velocity.y * deltaTime;
    }
}
