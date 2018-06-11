import {MinMax, Resources, Terrain2D} from "$components";
import {Actor, Component} from "$engine";
import {Enemy, Random} from "$game";
import {LateUpdate, Update} from "$systems";

/** Spawn enemies. */
export class EnemySpawn implements Component, Update, LateUpdate {

    private pool: Enemy[] = [];
    private enemies: Enemy[] = [];
    private delayCountDown: number = 0;

    /** Actor to whom this component belongs. */
    readonly actor?: Actor;

    /** Resource loader to use. */
    public resources: Resources;

    /** Max number of enemies. */
    public enemyLimit: number = 0;

    /** Factory which creates new enemy instance on request. */
    public enemyFactory: () => Enemy;

    /** Enemy 'X' axis velocity. */
    public enemyVelocity: number;

    /** Terrain where to spawn enemies. */
    public terrain: Terrain2D;

    /** Range of tiles by 'Y' axis where to spawn enemies. */
    public yTileRange: MinMax;

    /** Delay between consequent enemy spawns. */
    public delay: number;

    /** @inheritDoc */
    start() {
        this.terrain = this.terrain || this.actor.stage.findComponentOfType(Terrain2D);
        this.resources = this.resources || this.actor.stage.findComponentOfType(Resources);
    }

    /** @inheritDoc */
    update(deltaTime: number): void {

        // delay between spawns
        this.delayCountDown -= deltaTime;
        if (this.delayCountDown > 0)
            return;

        // are more enemies required?
        if (this.enemies.length >= this.enemyLimit)
            return;

        // spawn enemy
        const enemy = this.spawn();
        enemy.actor.active = true;
        this.enemies.push(enemy);

        // delay ±50%
        this.delayCountDown = this.delay * Random.deviation(.5);
    }

    /** @inheritDoc */
    lateUpdate(deltaTime: number): void {
        const {terrain} = this;
        const xMax = terrain.positionX(terrain.size.x);

        // deactivate enemies that has gone through the whole line
        for (let i = 0; i < this.enemies.length; i++) {
            const enemy = this.enemies[i];
            if (enemy.transform.position.x < xMax) continue;

            // deactivate enemy
            enemy.actor.active = false;
            this.pool.push(enemy);

            // fill empty slot
            const last = this.enemies.pop();
            if (i < this.enemies.length)
                this.enemies[i--] = last;
        }
    }

    private spawn(): Enemy {
        // request enemy instance
        const enemy = this.pool.length ? this.pool.pop() : this.enemyFactory();

        // configure
        const {terrain} = this;
        const transform = enemy.transform;
        transform.position.x = terrain.positionX(-1);
        const tileY = Random.rangeInt(this.yTileRange.min, this.yTileRange.max + 1);
        transform.position.y = terrain.positionY(tileY);

        // velocity ±50%
        enemy.motor.velocity.x = this.enemyVelocity * Random.deviation(.5);

        return enemy;
    }
}
