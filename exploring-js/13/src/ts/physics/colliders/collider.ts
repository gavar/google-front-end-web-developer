import {Actor, Component} from "$engine";
import {PhysicsBody2D} from "$physics";
import {Gizmo2D} from "$systems";
import {Mutable} from "@syntax";
import {CapsuleCollider2D} from "./capsule-collider";

/**
 * Base class for primitive collider shapes.
 */
export abstract class Collider2D implements Component, Gizmo2D {

    /** @inheritDoc */
    public readonly actor: Actor;

    /** Physics body controlling this collider. */
    public readonly body: PhysicsBody2D;

    /** @inheritDoc */
    public gizmo?: boolean;

    /** Warm-up collider for collision calculations. */
    abstract recalculate(): void;

    /**
     * Test whether this collider intersects with given collider.
     * @param collider - collider to test against.
     */
    abstract intersect(collider: Collider2D): boolean;

    /**
     * Test whether this collider intersects given capsule collider.
     * @param capsule - capsule collider to test against.
     */
    abstract intersectCapsule(capsule: CapsuleCollider2D): boolean;

    /** @inheritDoc */
    awake(this: Mutable<this>) {
        this.body = this.actor.require(PhysicsBody2D);
    }

    /** @inheritDoc */
    abstract drawGizmo2D(ctx: CanvasRenderingContext2D);
}
