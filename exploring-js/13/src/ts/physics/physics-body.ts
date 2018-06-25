import {Layer, Transform} from "$/components";
import {Actor, Component} from "$/engine";
import {Mutable} from "@syntax";
import {Collider2D} from "./colliders";

/**
 * Physics body represents a physics unit which may contain multiple colliders.
 */
export class PhysicsBody2D implements Component {

    /** @inheritDoc */
    public readonly actor: Actor;

    /** @inheritDoc */
    public readonly enabled: boolean;

    /** @inheritDoc */
    public readonly destroyed: boolean;

    /** Transformation of this body. */
    public readonly transform: Transform;

    /** Layer of the actor for intersection checks. */
    public readonly layer: Layer;

    /** @inheritDoc */
    awake(this: Mutable<this>) {
        this.layer = this.actor.require(Layer);
        this.transform = this.actor.require(Transform);
    }

    /** Trigger entering into collider. */
    enter(collider: Collider2D): void {
        for (const component of this.actor.components)
            (component as PhysicsListener2D).triggerEnter2D &&
            (component as PhysicsListener2D).triggerEnter2D(collider);
    }

    /** Trigger staying in touch with collider. */
    stay(collider: Collider2D): void {
        for (const component of this.actor.components)
            (component as PhysicsListener2D).triggerStay2D &&
            (component as PhysicsListener2D).triggerStay2D(collider);
    }

    /** Trigger leaving collider. */
    exit(collider: Collider2D): void {
        for (const component of this.actor.components)
            (component as PhysicsListener2D).triggerExit2D &&
            (component as PhysicsListener2D).triggerExit2D(collider);
    }
}

/**
 * Represents component listening for 2D physics events.
 */
export interface PhysicsListener2D {

    /**
     * Occurs when {@link PhysicsBody2D} enters into a collision with new collider.
     * @param collider - intersected collider.
     */
    triggerEnter2D?(collider: Collider2D): void;

    /**
     * Occurs once per physics update while {@link PhysicsBody2D} touching collider.
     * @param collider - collider being touched.
     */
    triggerStay2D?(collider: Collider2D): void;

    /**
     * Occurs when {@link PhysicsBody2D} leaves a previously intersected collider.
     * @param collider - intersected collider.
     */
    triggerExit2D?(collider: Collider2D): void;
}
