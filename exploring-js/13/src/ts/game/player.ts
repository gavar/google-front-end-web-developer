import {Actor, Component} from "$engine";
import {View} from "$game";
import {Collider2D, PhysicsListener2D} from "$physics";

export class Player implements Component, PhysicsListener2D {

    /** @inheritDoc */
    public readonly actor?: Actor;

    public view: View;

    /** @inheritDoc */
    start() {
        this.view = this.view || this.actor.require(View);
        this.view.setImage("char-boy.png");
    }

    /** @inheritDoc */
    triggerEnter2D(collider: Collider2D): void {
        console.log("enter", collider.actor.name, collider.actor.id);
    }

    /** @inheritDoc */
    triggerExit2D(collider: Collider2D): void {
        console.log("exit", collider.actor.name, collider.actor.id);
    }
}
