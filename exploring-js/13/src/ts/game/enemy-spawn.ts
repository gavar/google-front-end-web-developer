import {MinMax, Motor, Resources, Terrain2D} from "$components";
import {Actor, Component} from "$engine";
import {Enemy, Random, View} from "$game";
import {LateUpdate, Update} from "$systems";

/** Spawn enemies. */
export class EnemySpawn implements Component, Update, LateUpdate {

    private enemies: Enemy[] = [];
    private enemyPool: Enemy[] = [];
    private delayCountDown: number = 0;

    /** Actor to whom this component belongs. */
    readonly actor?: Actor;

    /** Resource loader to use. */
    public resources: Resources;

    /** Max number of enemies. */
    public enemyLimit: number = 0;

    /** Name of the enemy image to display. */
    public enemyImageName: string = "";

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
        const terrain = this.terrain;
        const xMax = terrain.positionX(terrain.size.x + 1);

        // deactivate enemies that has gone through the whole line
        for (let i = 0; i < this.enemies.length; i++) {
            const enemy = this.enemies[i];
            if (enemy.transform.position.x < xMax) continue;

            // deactivate enemy
            enemy.actor.active = false;
            this.enemyPool.push(enemy);

            // fill empty slot
            const last = this.enemies.pop();
            if (i < this.enemies.length)
                this.enemies[i--] = last;
        }
    }

    private spawn(): Enemy {
        // request enemy instance
        let enemy: Enemy;
        if (this.enemyPool.length) {
            enemy = this.enemyPool.pop();
        }
        else {
            // instantiate
            const actor = this.actor.stage.createActor("enemy");
            enemy = actor.add(Enemy);
            enemy.view = actor.add(View);
            enemy.view.resources = this.resources;
            enemy.motor = actor.add(Motor);
        }

        const tileY = Random.rangeInt(this.yTileRange.min, this.yTileRange.max);

        // configure
        const terrain = this.terrain;
        const transform = enemy.transform;
        transform.position.x = terrain.positionX(-1.5);
        transform.position.y = terrain.positionY(tileY);
        enemy.view.setImage(this.enemyImageName);

        // velocity ±50%
        enemy.motor.velocity.x = this.enemyVelocity * Random.deviation(.5);

        return enemy;
    }
}
