import {Sprite} from "$components";
import {Actor, Component} from "$engine";
import {PhysicsBody2D} from "$physics";
import {LateUpdate} from "$systems";

export class Ghost implements Component, LateUpdate {

    private time: number;

    /** @inheritDoc */
    public readonly actor?: Actor;

    /** Physics body attached to the actor. */
    public body: PhysicsBody2D;

    /** Sprite rendering this actor. */
    public sprite: Sprite;

    /** Whether to blink when closer to resurrection. */
    public blink: boolean;

    /** Duration of the ghost mode. */
    public duration: number;

    /** @inheritDoc */
    enable() {
        this.time = 0;
        this.body = this.body || this.actor.get(PhysicsBody2D);
        this.sprite = this.sprite || this.actor.get(Sprite);
        this.sprite.filter = "grayscale(100%)";
        this.sprite.opacity = .5;
        Component.disable(this.body);
    }

    /** @inheritDoc */
    disable() {
        this.sprite.opacity = 1;
        this.sprite.filter = null;
        Component.enable(this.body);
    }

    /** @inheritDoc */
    lateUpdate(deltaTime: number): void {
        // accumulate time
        this.time += deltaTime;

        // disable if done
        if (this.time >= this.duration) {
            Component.disable(this);
            return;
        }

        // blinking animation
        if (this.blink) {
            const frequency = 2 + (this.time / this.duration) * 5; // frequency [2 - 7]
            const t = this.time * frequency;
            const sin = Math.sin(t % Math.PI); // [0;1] function with sine ease
            const opacity = sin * .75; // max 75% visibility
            this.sprite.opacity = opacity;
        }
    }
}
