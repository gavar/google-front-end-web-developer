import {Canvas, Terrain2D, Vector2} from "$components";
import {Actor, Component} from "$engine";
import {
    Bounty,
    BountySpawn,
    Enemy,
    EnemySpawn,
    GameDifficulty,
    GameEvents,
    GameSettings,
    Ghost,
    Player,
    PlayerControls,
    Random,
    TerrainPath,
} from "$game";
import {PhysicsBody2D} from "$physics";
import {Draw2D} from "$systems";
import {CinematicScene, GameOverDialog, HowToPlayDialog, MainMenuDialog, OverlayView, StatsView} from "$ui";
import {Mutable} from "@syntax";

export class GameController implements Component, Draw2D {

    /** @inheritDoc */
    public readonly actor?: Actor;

    /** Game settings. */
    public readonly settings: GameSettings;

    /** Game difficulty. */
    public readonly difficulty: GameDifficulty;

    public canvas: Canvas;
    public player: Player;
    public controls: PlayerControls;
    public terrain: Terrain2D;
    public terrainPath: TerrainPath;
    public enemySpawn: EnemySpawn;
    public bountySpawn: BountySpawn;

    public overlay: OverlayView;
    public statsView: StatsView;
    public gameOver: GameOverDialog;
    public howToPlay: HowToPlayDialog;
    public mainMenu: MainMenuDialog;
    public cinematicScene: CinematicScene;

    private outer: HTMLElement;
    private inner: HTMLElement;
    private outlines: HTMLElement[];

    private readonly toTile: Vector2 = {x: 0, y: 0};
    private readonly fromTile: Vector2 = {x: 0, y: 0};

    /** @inheritDoc */
    awake(this: Mutable<this>) {
        this.settings = this.actor.require(GameSettings);
        this.difficulty = this.actor.require(GameDifficulty);
        this.difficulty.settings = this.settings;
    }

    /** @inheritDoc */
    start() {
        const {stage} = this.actor;
        this.canvas = this.canvas || stage.findComponentOfType(Canvas);
        this.player = this.player || stage.findComponentOfType(Player);
        this.controls = this.controls || stage.findComponentOfType(PlayerControls);
        this.terrain = this.terrain || stage.findComponentOfType(Terrain2D);
        this.enemySpawn = this.enemySpawn || stage.findComponentOfType(EnemySpawn);
        this.bountySpawn = this.bountySpawn || stage.findComponentOfType(BountySpawn);
        this.terrainPath = this.terrainPath || stage.findComponentOfType(TerrainPath);

        // ui
        this.overlay = this.overlay || stage.findComponentOfType(OverlayView);
        this.gameOver = this.gameOver || stage.findComponentOfType(GameOverDialog);
        this.mainMenu = this.mainMenu || stage.findComponentOfType(MainMenuDialog);
        this.howToPlay = this.howToPlay || stage.findComponentOfType(HowToPlayDialog);
        this.statsView = this.statsView || stage.findComponentOfType(StatsView);
        this.cinematicScene = this.cinematicScene || stage.findComponentOfType(CinematicScene);

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
        // outlines list
        this.outlines = [this.outer, this.inner];

        // difficulty
        this.bountySpawn.chance = () => this.difficulty.bonusChance;
        this.enemySpawn.delay = () => this.difficulty.enemyDelay;
        this.enemySpawn.enemyLimit = () => this.difficulty.enemyLimit;
        this.enemySpawn.enemyVelocity = () => this.difficulty.enemyVelocity;

        // ui
        this.mainMenu.actor.on("how-to-play", this.showHowToPlay, this);
        this.mainMenu.actor.on("play", this.play, this);
        this.howToPlay.actor.on("back", this.showMainMenu, this);
        this.gameOver.actor.on("play", this.play, this);

        // initial state
        Component.disable(this.controls);

        // show first screen
        window.setTimeout(() => this.showMainMenu(), 100);
    }

    /** Play the game. */
    play(): void {
        const {terrain, player, difficulty, settings, overlay} = this;

        // discard previous game state
        overlay.close();
        player.stats.reset();
        difficulty.reset();

        // warm-up components
        Component.disable(this.player.actor.get(Ghost));
        Component.restart(this.controls);
        Component.restart(this.enemySpawn);
        Component.restart(this.bountySpawn);

        // initial values
        player.stats.set("lives", settings.lives);

        // initial player position
        player.applyPosition(
            terrain.positionX(Math.floor(terrain.size.x * .5)),
            terrain.positionY(0),
        );

        // initial path
        this.continuePath(0);

        // ui
        this.overlay.show(this.statsView);
    }

    /** @inheritDoc */
    draw2D(ctx: CanvasRenderingContext2D): void {
        this.outlineLayout();
        this.overlayLayout();
    }

    private overlayLayout() {
        const {overlay, canvas} = this;
        const {root} = overlay;
        root.style.top = `${canvas.element.offsetTop}px`;
        root.style.left = `${canvas.element.offsetLeft}px`;
        root.style.width = `${canvas.element.width}px`;
        root.style.height = `${canvas.element.height}px`;
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

    private showMainMenu(): void {
        this.overlay.close();
        this.overlay.show(this.mainMenu);
    }

    private showHowToPlay(): void {
        this.overlay.close();
        this.overlay.show(this.howToPlay);
    }

    /** Player steps on an enemy. */
    private hitByEnemy(enemy: Enemy) {
        this.playHitGfx();
        this.player.hit();

        // ghost mode
        const {player, settings} = this;
        const {dead} = player.stats;
        const ghost = player.actor.require(Ghost);
        ghost.blink = !dead;
        ghost.duration = dead ? Number.POSITIVE_INFINITY : settings.invulnerabilityDuration;
        Component.enable(ghost);
    }

    /** Player steps on a bounty. */
    private collectBounty(bounty: Bounty) {
        const {terrain, player, settings} = this;

        const bountyType = this.resolveBountyType(bounty);
        bounty.actor.destroy();

        // scores
        const score = settings.scores[bountyType];
        player.stats.modify("score", score);

        // specials
        switch (bountyType) {
            case "heart":
                player.stats.modify("lives", 1);
                break;
            case "checkpoint":
                this.enemySpawn.speedup();
                this.bountySpawn.gamble();

                const y = player.position.y <= terrain.positionY(1) ? 0 : terrain.size.y - 1;
                this.continuePath(terrain.positionY(y));

                this.difficulty.advance();
                this.player.stats.set("level", this.difficulty.level);
                break;
        }
    }

    /** Players dies */
    private die() {
        const {controls, player} = this;
        Component.disable(controls); // disable controls
        Component.disable(player.actor.get(PhysicsBody2D)); // disable collision
        this.overlay.show(this.gameOver); // show game-over dialog
    }

    /** Play again. */
    private replay() {
        this.play();
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
        const toY = fromTile.y > 1 ? 0 : terrain.size.y - 1;

        // generate path
        const finish = terrainPath.generate(fromTile.x, fromTile.y, toY);
        this.toTile.x = finish.x;
        this.toTile.y = finish.y;

        // generate bounty
        const bounty = this.bountySpawn.spawn(finish.x, finish.y);
        bounty.highlight.setHighlightActive(true);
    }

    private resolveBountyType(bounty: Bounty) {
        const image = bounty.view.sprite.image;
        const name = image && image.name || "checkpoint";
        const index = name.lastIndexOf(".");
        return index >= 0 ? name.slice(0, index) : name;
    }
}
