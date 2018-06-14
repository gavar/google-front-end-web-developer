import {Reactive} from "$game";

export class PlayerStats extends Reactive {

    /** Player score. */
    public readonly score: number = 0;

    /** Player lives. */
    public readonly lives: number = 0;

    /** Player initial lives. */
    public readonly initLives: number = 3;

    /** Reset stats to initial value. */
    reset(): this {
        this.set("score", 0);
        this.set("lives", this.initLives);
        return this;
    }
}
