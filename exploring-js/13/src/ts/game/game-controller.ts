import {Canvas, Terrain2D, Vector2} from "$components";
import {Actor, Component} from "$engine";
import {
    Bounty,
    BountySpawn,
    Enemy,
    GameEvents,
    GameSettings,
    Player,
    PlayerController,
    Random,
    TerrainPath,
} from "$game";
import {PhysicsBody2D} from "$physics";
import {Draw2D} from "$systems";
import {Mutable} from "@syntax";

export class GameController implements Component, Draw2D {

    /** @inheritDoc */
    public readonly actor?: Actor;

    /** @inheritDoc */
    public readonly settings: GameSettings;

    public canvas: Canvas;
    public player: Player;
    public controls: PlayerController;
    public terrain: Terrain2D;
    public terrainPath: TerrainPath;
    public bountySpawn: BountySpawn;

    private outer: HTMLElement;
    private inner: HTMLElement;
    private outlines: HTMLElement[];

    private readonly toTile: Vector2 = {x: 0, y: 0};
    private readonly fromTile: Vector2 = {x: 0, y: 0};

    /** @inheritDoc */
    awake(this: Mutable<this>) {
        this.settings = this.actor.require(GameSettings);
    }

    /** @inheritDoc */
    start() {
        const {stage} = this.actor;
        this.canvas = this.canvas || stage.findComponentOfType(Canvas);
        this.player = this.player || stage.findComponentOfType(Player);
        this.controls = this.controls || stage.findComponentOfType(PlayerController);
        this.terrain = this.terrain || stage.findComponentOfType(Terrain2D);
        this.terrainPath = this.terrainPath || stage.findComponentOfType(TerrainPath);
        this.bountySpawn = this.bountySpawn || stage.findComponentOfType(BountySpawn);

        // player events
        const {player} = this;
        player.actor.on(GameEvents.PLAYER_DIE, this.die, this);
        player.actor.on(GameEvents.PLAYER_ENEMY_COLLISION, this.hitByEnemy, this);
        player.actor.on(GameEvents.PLAYER_BOUNTY_COLLISION, this.collectBounty, this);

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

    /** Play the game. */
    play(): void {
        const {controls, terrain, player, settings, bountySpawn} = this;

        // initial values
        bountySpawn.chance = .25; // 25% bonus chance
        player.stats.reset();
        player.stats.set("lives", settings.lives);

        // initial player position
        controls.applyPosition(
            terrain.positionX(Math.floor(terrain.size.x * .5)),
            terrain.positionY(0),
        );

        // initial path
        this.continuePath(0);
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

    /** Player steps on an enemy. */
    private hitByEnemy(enemy: Enemy) {
        this.playHitGfx();
        this.player.hit();
        // TODO: enable ghost mode for 5 sec when receives hit
    }

    /** Player steps on a bounty. */
    private collectBounty(bounty: Bounty) {
        const image = bounty.view.sprite.image;
        if (image) {
            // bonus
            // TODO: give bonus
        }
        else {
            // checkpoint
            this.bountySpawn.gamble();
            this.continuePath(this.controls.position.y);
        }

        bounty.actor.destroy();
    }

    /** Players dies */
    private die() {
        const {controls, player} = this;
        Component.disable(controls); // disable controls
        Component.disable(player.actor.get(PhysicsBody2D)); // disable collision
    }

    /** Player player hit GFX. */
    private playHitGfx() {
        for (const outline of this.outlines) {
            outline.classList.remove("hit");
            outline.style.animation = "none";
            outline.offsetHeight; // reflow
            outline.style.animation = null;
            outline.classList.add("hit");
        }
    }

    private continuePath(fromY: number) {
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
