import {Transform} from "$components";
import {Actor, Component} from "$engine";
import {Bounty, Enemy, GameEvents, PlayerStats, View} from "$game";
import {Collider2D, PhysicsListener2D} from "$physics";
import {Mutable} from "@syntax";

export class Player implements Component, PhysicsListener2D {

    /** @inheritDoc */
    public readonly actor?: Actor;

    /** Player image view. */
    public readonly view: View;

    /** Player's transform. */
    public readonly transform: Transform;

    /** Player's stats. */
    public readonly stats: PlayerStats;

    /** @inheritDoc */
    awake(this: Mutable<this>) {
        this.view = this.actor.require(View);
        this.stats = this.actor.require(PlayerStats);
        this.transform = this.actor.require(Transform);
    }

    /** @inheritDoc */
    start() {
        // TODO: select char
        this.view.setImage("char-boy.png");
    }

    /** Hit player. */
    hit() {
        const {stats} = this;
        if (stats.dead)
            throw new Error("player is already dead!");

        // take out life
        stats.set("lives", stats.lives - 1);
        this.actor.emit(GameEvents.PLAYER_HIT, this); // hit event

        // last life?
        if (stats.lives <= 0)
            this.kill();
    }

    /** Kill player. */
    kill() {
        if (this.stats.dead)
            throw new Error("player is already dead!");

        this.stats.set("dead", true); // death flag
        this.actor.emit(GameEvents.PLAYER_DIE, this); // die event
    }

    /** @inheritDoc */
    triggerEnter2D(collider: Collider2D): void {
        const bounty = collider.actor.get(Bounty);
        if (bounty)
            this.actor.emit(GameEvents.PLAYER_BOUNTY_COLLISION, bounty);

        const enemy = collider.actor.get(Enemy);
        if (enemy)
            this.actor.emit(GameEvents.PLAYER_ENEMY_COLLISION, enemy);
    }

    /** @inheritDoc */
    triggerExit2D(collider: Collider2D): void {
        console.log("exit", collider.actor.name, collider.actor.id);
    }
}
