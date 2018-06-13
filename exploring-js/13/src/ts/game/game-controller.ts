import {Canvas, Terrain2D, Vector2} from "$components";
import {Actor, Component} from "$engine";
import {Bounty, BountySpawn, Enemy, GameEvents, PlayerController, Random, TerrainPath} from "$game";
import {Draw2D, Update} from "$systems";

export class GameController implements Component, Update, Draw2D {

    /** @inheritDoc */
    public readonly actor?: Actor;

    public player: PlayerController;
    public terrain: Terrain2D;
    public terrainPath: TerrainPath;
    public bountySpawn: BountySpawn;
    public canvas: Canvas;

    private outer: HTMLElement;
    private inner: HTMLElement;
    private outlines: HTMLElement[];

    private readonly toTile: Vector2 = {x: 0, y: 0};
    private readonly fromTile: Vector2 = {x: 0, y: 0};

    /** @inheritDoc */
    start() {
        const {stage} = this.actor;
        this.canvas = this.canvas || stage.findComponentOfType(Canvas);
        this.player = this.player || stage.findComponentOfType(PlayerController);
        this.terrain = this.terrain || stage.findComponentOfType(Terrain2D);
        this.terrainPath = this.terrainPath || stage.findComponentOfType(TerrainPath);
        this.bountySpawn = this.bountySpawn || stage.findComponentOfType(BountySpawn);

        // player events
        const {player} = this;
        player.actor.on(GameEvents.PLAYER_HIT_BY, this.onHitBy, this);
        player.actor.on(GameEvents.PLAYER_COLLECT_BOUNTY, this.onCollectBounty, this);

        // outer outline
        this.outer = document.createElement("div");
        this.outer.classList.add("outer");
        this.outer.style.position = "absolute";
        this.canvas.element.parentElement.appendChild(this.outer);

        // inner outline
        this.inner = document.createElement("div");
        this.inner.classList.add("inner");
        this.inner.style.position = "absolute";
        this.canvas.element.parentElement.appendChild(this.inner);

        this.outlines = [this.outer, this.inner];
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
    /** @inheritDoc */
    update(deltaTime: number): void {

    }

    /** @inheritDoc */
    draw2D(ctx: CanvasRenderingContext2D): void {
        this.outlineLayout();
    }

    private outlineLayout() {
        const {inner, outer, terrain, canvas} = this;
        const offsetY = terrain.tile.yMin * canvas.transform.scale.y;

        outer.style.top = `${offsetY + 2}px`;
        outer.style.left = `${canvas.element.offsetLeft}px`;
        outer.style.width = `${canvas.element.width}px`;
        outer.style.height = `${canvas.element.height - offsetY - 8}px`;

        inner.style.top = `${offsetY - 2}px`;
        inner.style.left = `${canvas.element.offsetLeft}px`;
        inner.style.width = `${canvas.element.width}px`;
        inner.style.height = `${canvas.element.height - offsetY - 1}px`;
    }

    private onHitBy(enemy: Enemy) {
        // hit effect
        for (const outline of this.outlines) {
            outline.classList.remove("hit");
            outline.style.animation = "none";
            outline.offsetHeight; // reflow
            outline.style.animation = null;
            outline.classList.add("hit");
        }
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
        const {terrain, terrainPath, fromTile} = this;

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
