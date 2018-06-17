import {Actor, Component} from "$engine";
import {GameSettings} from "$game";
import {Mutable} from "@syntax";

export class GameDifficulty implements Component {

    /** @inheritDoc */
    public readonly actor: Actor;

    /** Game settings */
    public settings: GameSettings;

    /** Game difficulty level. */
    public readonly level: number;

    /** @see GameSettings#enemyLimit */
    public readonly enemyLimit: number;

    /** @see GameSettings#enemyDelay */
    public readonly enemyDelay: number;

    /** @see GameSettings#enemyVelocity */
    public readonly enemyVelocity: number;

    /** @see GameSettings#bonusChance */
    public readonly bonusChance: number;

    /** Advance game to a next level of difficulty. */
    advance(this: Mutable<this>) {
        this.level++;
        this.recalculate();
    }

    /** Reset game difficulty to initial values. */
    reset(this: Mutable<this>) {
        this.level = 0;
        this.recalculate();
    }

    /** Recalculate game difficulty values. */
    recalculate(this: Mutable<this>) {
        const {settings, level} = this;

        const percents = level / 100;
        this.bonusChance = settings.bonusChance * (1 + 2 * percents); // 2% increase per level
        this.bonusChance = Math.min(this.bonusChance, 1); // max 100%

        this.enemyDelay = settings.enemyDelay * (1 - percents); // 1% faster per level
        this.enemyDelay = Math.max(this.enemyDelay, .25); // not lower than 250ms

        this.enemyLimit = settings.enemyLimit * (1 + 5 * percents); // 5% more per level
        this.enemyLimit = Math.floor(this.enemyLimit); // floor to integer

        this.enemyVelocity = settings.enemyVelocity * (1 + 5 * percents); // 5% faster per level
    }
}
