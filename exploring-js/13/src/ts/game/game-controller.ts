import {Terrain2D, Vector2} from "$components";
import {Actor, Component} from "$engine";
import {Bounty, BountySpawn, Enemy, GameEvents, Player, Random, TerrainPath} from "$game";

export class GameController implements Component {

    /** @inheritDoc */
    public readonly actor?: Actor;

    public player: Player;
    public terrain: Terrain2D;
    public terrainPath: TerrainPath;
    public bountySpawn: BountySpawn;

    private readonly fromTile: Vector2 = {x: 0, y: 0};
    private readonly toTile: Vector2 = {x: 0, y: 0};
    private readonly temporary: Vector2 = {x: 0, y: 0};

    /** @inheritDoc */
    start() {
        const {stage} = this.actor;
        this.player = this.player || stage.findComponentOfType(Player);
        this.terrain = this.terrain || stage.findComponentOfType(Terrain2D);
        this.terrainPath = this.terrainPath || stage.findComponentOfType(TerrainPath);
        this.bountySpawn = this.bountySpawn || stage.findComponentOfType(BountySpawn);
        this.play();
    }

    play(): void {
        const {player, terrain} = this;

        // player events
        player.actor.on(GameEvents.PLAYER_HIT_BY, this.onHitBy, this);
        player.actor.on(GameEvents.PLAYER_COLLECT_BOUNTY, this.onCollectBounty, this);

        // initial player position
        const playerPosition = player.transform.position;
        playerPosition.x = terrain.positionX(Math.floor(terrain.size.x * .5));
        playerPosition.y = terrain.positionY(0);

        // generate first path
        this.nextPath(0);
    }

    private onHitBy(enemy: Enemy) {
        console.log("player hit by", enemy);
    }

    private onCollectBounty(bounty: Bounty) {
        console.log("collect bounty", bounty);
        bounty.actor.destroy();
        this.nextPath(this.player.transform.position.y);
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
        temporary.x = terrain.positionX(finish.x);
        temporary.y = terrain.positionY(finish.y);
        const bounty = this.bountySpawn.spawn(temporary);
        bounty.highlight.setHighlightActive(true);
    }
}
