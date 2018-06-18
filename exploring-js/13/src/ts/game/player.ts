import {Transform, Vector2} from "$components";
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

    /**
     * Position where player should be located.
     * Use this value for logic calculations instead of transforms portion
     * since transform can be used to smoothly move player over time.
     */
    public position: Vector2 = {x: 0, y: 0};

    /** Smooth movement velocity, which can be used to store value of {@link Mathf#smooth}. */
    public velocity: Vector2 = {x: 0, y: 0};

    /** @inheritDoc */
    awake(this: Mutable<this>) {
        this.view = this.actor.require(View);
        this.stats = this.actor.require(PlayerStats);
        this.transform = this.actor.require(Transform);
    }

    /** @inheritDoc */
    enable() {
        this.position.x = this.transform.position.x;
        this.position.y = this.transform.position.y;
        this.velocity.x = this.velocity.y = 0;
    }

    /** @inheritDoc */
    start() {
        // TODO: select char
        this.view.setImage("char-boy.png");
    }

    /** Apply {@link position} value to a {@link transform}. */
    applyPosition(x: number, y: number): void {
        this.transform.position.x = this.position.x = x;
        this.transform.position.y = this.position.y = y;
        this.velocity.x = this.velocity.y = 0;
    }

    /**
     * Smoothly move player.
     * @param smoothTime - approx time of achieving destination value.
     * @param deltaTime - ime since last call of this function.
     */
    smooth(smoothTime: number, deltaTime: number) {
        Vector2.smooth(this.transform.position, this.position, this.velocity, smoothTime, deltaTime);
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
