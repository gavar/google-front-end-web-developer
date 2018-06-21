import {TerrainLayer2D, Transform, Vector2} from "$components";
import {Actor, Component} from "$engine";
import {Bounty, Random, TerrainPath} from "$game";

export class BountySpawn implements Component {

    private readonly actors: Set<Actor> = new Set<Actor>();

    /** @inheritDoc */
    public readonly actor?: Actor;

    /** Positions for bonus tile. */
    public readonly spots: Vector2[] = [];

    /** List of bonus images. */
    public readonly bonuses: string[] = [
        "heart.png",
        "gem-blue.png",
        "gem-green.png",
        "gem-orange.png",
    ];

    /** Terrain path generator. */
    public terrainPath: TerrainPath;

    /** Layer for rendering path tiles. */
    public bonusPathLayer: TerrainLayer2D;

    /** Factory which creates new {@link Bounty} instance on request. */
    public bountyFactory: () => Bounty;

    /** Bonus chance calculation func. */
    public chance: () => number;

    /** @inheritDoc */
    start() {
        this.terrainPath = this.terrainPath || this.actor.stage.findComponentOfType(TerrainPath);
    }

    /** @inheritDoc */
    disable() {
        for (const actor of this.actors)
            if (!actor.destroyed)
                actor.destroy();
    }

    /** Spawn bounty on the given position. */
    spawn(x: number, y: number): Bounty {
        const {terrain} = this.bonusPathLayer;
        const bounty = this.bountyFactory();
        const {position} = bounty.transform;
        position.x = terrain.positionX(x);
        position.y = terrain.positionY(y);
        this.actors.add(bounty.actor);
        return bounty;
    }

    /** Randomly generate special bonus. */
    gamble() {
        // success if in (0; chance] range
        if (Math.random() > this.chance())
            return;

        const {bonusPathLayer} = this;
        Random.shuffle(this.spots);
        for (const spot of this.spots) {
            if (!bonusPathLayer.getTile(spot.x, spot.y)) {
                this.bonus(spot.x, spot.y);
                break;
            }
        }
    }

    private bonus(x: number, y: number) {
        const {bonusPathLayer, bonuses, terrainPath} = this;
        const bounty = this.spawn(x, y);

        const {sprite} = bounty.view;
        sprite.setScale(.5, .5);
        sprite.setOffset(.25, .25);

        const bonus = bonuses[Random.rangeInt(0, bonuses.length)];
        bounty.view.setImage(bonus);
        bounty.actor.on(Actor.DESTROYING, this.onBonusDestroy, this);
        bonusPathLayer.setTile(x, y, terrainPath.image);
    }

    private onBonusDestroy(actor: Actor) {
        this.actors.delete(actor);
        const {bonusPathLayer} = this;
        const {terrain} = bonusPathLayer;
        const transform = actor.get(Transform);
        const row = terrain.rowByPosX(transform.position.x);
        const col = terrain.colByPosY(transform.position.y);
        bonusPathLayer.setTile(row, col);
    }
}
