import {Terrain2D, Vector2} from "$components";
import {Actor, Component} from "$engine";
import {Bounty, BountySpawn, Enemy, GameEvents, PlayerController, Random, TerrainPath} from "$game";

export class GameController implements Component {

    /** @inheritDoc */
    public readonly actor?: Actor;

    public player: PlayerController;
    public terrain: Terrain2D;
    public terrainPath: TerrainPath;
    public bountySpawn: BountySpawn;

    private readonly fromTile: Vector2 = {x: 0, y: 0};
    private readonly toTile: Vector2 = {x: 0, y: 0};
    private readonly temporary: Vector2 = {x: 0, y: 0};

    /** @inheritDoc */
    start() {
        const {stage} = this.actor;
        this.player = this.player || stage.findComponentOfType(PlayerController);
        this.terrain = this.terrain || stage.findComponentOfType(Terrain2D);
        this.terrainPath = this.terrainPath || stage.findComponentOfType(TerrainPath);
        this.bountySpawn = this.bountySpawn || stage.findComponentOfType(BountySpawn);

        // player events
        const {player} = this;
        player.actor.on(GameEvents.PLAYER_HIT_BY, this.onHitBy, this);
        player.actor.on(GameEvents.PLAYER_COLLECT_BOUNTY, this.onCollectBounty, this);

        this.play();
    }

    play(): void {
        const {player, terrain} = this;

        // initial values
        this.bountySpawn.chance = .25; // 25% bonus chance

        // initial player position
        player.applyPosition(
            terrain.positionX(Math.floor(terrain.size.x * .5)),
            terrain.positionY(0),
        );

        // generate first path
        this.nextPath(0);
    }

    private onHitBy(enemy: Enemy) {
        console.log("player hit by", enemy);
    }

    private onCollectBounty(bounty: Bounty) {
        const image = bounty.view.sprite.image;
        if (image) {
            // bonus
        }
        else {
            // checkpoint
            this.bountySpawn.gamble();
            this.nextPath(this.player.position.y);
        }

        bounty.actor.destroy();
    }

    private nextPath(fromY: number) {
        const {terrain, terrainPath, fromTile, temporary} = this;

        // update from tile
        fromTile.x = Random.rangeInt(1, terrain.size.x - 1);
        fromTile.y = terrain.colByPosY(fromY);
        const toY = fromTile.y > 0 ? 0 : terrain.size.y - 1;

        // generate path
        const finish = terrainPath.generate(fromTile.x, fromTile.y, toY);
        this.toTile.x = finish.x;
        this.toTile.y = finish.y;

        // generate bounty
        const bounty = this.bountySpawn.spawn(finish.x, finish.y);
        bounty.highlight.setHighlightActive(true);
    }
}
