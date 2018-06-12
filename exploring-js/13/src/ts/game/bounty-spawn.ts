import {TerrainLayer2D, Transform, Vector2} from "$components";
import {Actor, Component} from "$engine";
import {Bounty, Random, TerrainPath} from "$game";

export class BountySpawn implements Component {

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

    /** Chance to spawn a bonus. */
    public chance: number;

    /** Spawn bounty on the given position. */
    spawn(x: number, y: number): Bounty {
        const {terrain} = this.bonusPathLayer;
        const bounty = this.bountyFactory();
        const {transform} = bounty;
        transform.position.x = terrain.positionX(x);
        transform.position.y = terrain.positionY(y);
        return bounty;
    }

    /** Randomly generate special bonus. */
    gamble() {
        // success if in (0; chance] range
        if (Math.random() > this.chance)
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
        const bonus = bonuses[Random.rangeInt(0, bonuses.length)];
        bounty.view.setImage(bonus);
        bounty.actor.on(Actor.DESTROYING, this.onBonusDestroy, this);
        bonusPathLayer.setTile(x, y, terrainPath.image);
    }

    private onBonusDestroy(actor: Actor) {
        const {bonusPathLayer} = this;
        const {terrain} = bonusPathLayer;
        const transform = actor.get(Transform);
        const row = terrain.rowByPosX(transform.position.x);
        const col = terrain.colByPosY(transform.position.y);
        bonusPathLayer.setTile(row, col);
    }
}
