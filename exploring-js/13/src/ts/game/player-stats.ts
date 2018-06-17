import {Reactive} from "$game";

export class PlayerStats extends Reactive {

    /** Player score. */
    public readonly score: number;

    /** How far player completed the game. */
    public readonly level: number;

    /** Player lives. */
    public readonly lives: number;

    /** Flag indicating that player is dead. */
    public readonly dead: boolean;

    /** @inheritDoc */
    awake() {
        this.reset();
    }

    /** Reset stats to initial value. */
    reset(): this {
        this.set("score", 0);
        this.set("level", 0);
        this.set("lives", 0);
        this.set("dead", false);
        return this;
    }
}
