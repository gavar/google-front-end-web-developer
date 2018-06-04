import {Layer, Transform} from "$components";
import {Actor, Component} from "$engine";
import {Mutable} from "@syntax";

/**
 * Physics body represents a physics unit which may contain multiple colliders.
 */
export class PhysicsBody2D implements Component {

    /** @inheritDoc */
    public readonly actor: Actor;

    /** Transformation of this body. */
    public readonly transform: Transform;

    /** Layer of the actor for intersection checks. */
    public readonly layer: Layer;

    /** @inheritDoc */
    awake(this: Mutable<this>) {
        this.layer = this.actor.require(Layer);
        this.transform = this.actor.require(Transform);
    }
}
