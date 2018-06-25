import {Actor, Component} from "$/engine";
import {GameDifficulty} from "$/game";
import {LateUpdate} from "$/systems";

/**
 * Renders debug information about current game difficulty.
 */
export class DifficultyView implements Component, LateUpdate {

    /** @inheritDoc */
    public readonly actor: Actor;

    public root: HTMLElement;
    public difficulty: GameDifficulty;

    /** @inheritDoc */
    start() {

        this.difficulty = this.difficulty || this.actor.stage.findComponentOfType(GameDifficulty);
        if (!this.root) {
            this.root = document.createElement("p");
            document.body.appendChild(this.root);
        }
    }

    /** @inheritDoc */
    lateUpdate(deltaTime: number): void {
        const {difficulty} = this;
        this.root.innerText = `
        Level: ${difficulty.level}
        Enemy Limit: ${difficulty.enemyLimit}
        Enemy Delay: ${difficulty.enemyDelay}
        Enemy Velocity: ${difficulty.enemyVelocity}
        Bonus Chance: ${difficulty.bonusChance}
        `;
    }
}
