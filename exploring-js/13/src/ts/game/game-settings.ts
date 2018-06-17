import {Reactive} from "$game";
import {Dictionary} from "@syntax";

export class GameSettings extends Reactive {

    /** How much lives player have at start. */
    public readonly lives: number = 3;

    /** Scoring per each type of bounty. */
    public scores: Dictionary<string, number> = {
        "checkpoint": 100,
        "gem-blue": 300,
        "gem-green": 400,
        "gem-orange": 500,
    };
}
