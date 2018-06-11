import {Transform} from "$components";
import {Actor, Component} from "$engine";
import {Bounty, Enemy, GameEvents, View} from "$game";
import {Collider2D, PhysicsListener2D} from "$physics";

export class Player implements Component, PhysicsListener2D {

    /** @inheritDoc */
    public readonly actor?: Actor;

    /** Player image view. */
    public view: View;

    /** Player's transform. */
    public transform: Transform;

    /** @inheritDoc */
    awake() {
        this.transform = this.actor.require(Transform);
    }

    /** @inheritDoc */
    start() {
        this.view = this.view || this.actor.require(View);
        this.view.setImage("char-boy.png");
    }

    /** @inheritDoc */
    triggerEnter2D(collider: Collider2D): void {
        const bounty = collider.actor.get(Bounty);
        if (bounty) this.actor.emit(GameEvents.PLAYER_COLLECT_BOUNTY, bounty);

        const enemy = collider.actor.get(Enemy);
        if (enemy) this.actor.emit(GameEvents.PLAYER_HIT_BY, enemy);
    }

    /** @inheritDoc */
    triggerExit2D(collider: Collider2D): void {
        console.log("exit", collider.actor.name, collider.actor.id);
    }
}
