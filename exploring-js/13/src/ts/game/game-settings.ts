import {Reactive} from "$game";

export class GameSettings extends Reactive {
    /** How much lives player have at start. */
    public readonly lives: number = 3;
}
