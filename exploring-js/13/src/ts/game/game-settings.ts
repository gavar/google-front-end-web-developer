import {Reactive} from "$game";
import {Dictionary} from "@syntax";

export class GameSettings extends Reactive {

    /** How much lives player have at start. */
    public readonly lives: number = 3;

    /** Chance of spawning special bonus. */
    public bonusChance: number = .5;

    /** Delay between consequent enemy spawns. */
    public enemyDelay: number = 1;

    /** Maximum number of the enemies at the same time. */
    public enemyLimit: number = 2;

    /** Velocity of the enemies by 'X' axis. */
    public enemyVelocity: number = 50;

    /** How much time player is invulnerable to damage after being hit. */
    public invulnerabilityDuration: number = 5;

    /** Scoring per each type of bounty. */
    public scores: Dictionary<string, number> = {
        "checkpoint": 100,
        "gem-blue": 300,
        "gem-green": 400,
        "gem-orange": 500,
    };
}
