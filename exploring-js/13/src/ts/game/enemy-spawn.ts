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
    public enemyLimit: () => number;

    /** Factory which creates new enemy instance on request. */
    public enemyFactory: () => Enemy;

    /** Enemy 'X' axis velocity. */
    public enemyVelocity: () => number;

    /** Terrain where to spawn enemies. */
    public terrain: Terrain2D;

    /** Range of tiles by 'Y' axis where to spawn enemies. */
    public yTileRange: MinMax;

    /** Delay between consequent enemy spawns. */
    public delay: () => number;

    /**
     * Speed-up all enemies by given factor.
     * @param f - enemy speed multiplication.
     * @param min - min speed of the enemy.
     */
    speedup(f: number = 3, min: number = 300) {
        this.delayCountDown = 0;
        for (const enemy of this.enemies) {
            const velocity = enemy.motor.velocity;
            const sign = velocity.x >= 0 ? 1 : -1;
            const vx = Math.max(Math.abs(velocity.x) * f, min);
            velocity.x = vx * sign;
        }
    }

    /** @inheritDoc */
    start() {
        this.terrain = this.terrain || this.actor.stage.findComponentOfType(Terrain2D);
        this.resources = this.resources || this.actor.stage.findComponentOfType(Resources);
    }

    /** @inheritDoc */
    enable() {
        this.delayCountDown = 0;
    }

    /** @inheritDoc */
    update(deltaTime: number): void {
        const enemyLimit = this.enemyLimit();

        // delay between spawns
        this.delayCountDown -= deltaTime;
        if (this.delayCountDown > 0)
            return;

        // are more enemies required?
        if (this.enemies.length >= enemyLimit)
            return;

        // spawn enemy
        const enemy = this.spawn();
        enemy.actor.setActive(true);
        this.enemies.push(enemy);

        // delay ±25%
        this.delayCountDown = this.delay() * Random.deviation(.25);
    }

    /** @inheritDoc */
    lateUpdate(deltaTime: number): void {
        const {terrain} = this;
        const xMin = terrain.positionX(-1);
        const xMax = terrain.positionX(terrain.size.x);

        // deactivate enemies that has gone through the whole line
        for (let i = 0; i < this.enemies.length; i++) {
            const enemy = this.enemies[i];

            // check enemy is within terran range
            const {position} = enemy.transform;
            if (xMax - position.x > 1)
                if (position.x - xMin > 1)
                    continue;

            // deactivate enemy
            enemy.actor.setActive(false);
            this.pool.push(enemy);

            // fill empty slot
            const last = this.enemies.pop();
            if (i < this.enemies.length)
                this.enemies[i--] = last;
        }
    }

    /** @inheritDoc */
    disable() {
        while (this.enemies.length > 0) {
            const enemy = this.enemies.pop();
            enemy.actor.setActive(false);
            this.pool.push(enemy);
        }
    }

    private spawn(): Enemy {
        // request enemy instance
        const enemy = this.pool.length ? this.pool.pop() : this.enemyFactory();

        // select direction
        const leftToRight = Math.random() < 0.5;

        // configure
        const {terrain} = this;
        const tileY = Random.rangeInt(this.yTileRange.min, this.yTileRange.max + 1);
        enemy.transform.position.y = terrain.positionY(tileY);

        // velocity ±25%
        const velocity = this.enemyVelocity() * Random.deviation(.25);

        // setup direction
        if (leftToRight) {
            enemy.motor.velocity.x = velocity;
            enemy.transform.scale.x = 1;
            enemy.transform.position.x = terrain.positionX(-1);
        }
        else {
            enemy.motor.velocity.x = -velocity;
            enemy.transform.scale.x = -1;
            enemy.transform.position.x = terrain.positionX(terrain.size.x);
        }

        return enemy;
    }
}
