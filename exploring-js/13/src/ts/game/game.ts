import {Canvas, FPS, Layer, Motor, Resources, Sprite, Terrain2D} from "$/components";
import {Stage} from "$/engine";
import {
    Bounty,
    BountySpawn,
    Enemy,
    EnemySpawn,
    GameController,
    Player,
    PlayerControls,
    TerrainPath,
    View,
} from "$/game";
import {CapsuleCollider2D, CollisionSystem2D} from "$/physics";
import {DrawSystem, GizmoSystem, LateUpdateSystem, UpdateSystem} from "$/systems";
import {
    CinematicScene,
    DifficultyView,
    GameOverDialog,
    HowToPlayDialog,
    MainMenuDialog,
    OverlayView,
    StatsView,
} from "$/ui";

export namespace Layers {
    export const TERRAIN = 1;
    export const BOUNTY = 2;
    export const PLAYER = 3;
    export const ENEMY = 4;
}

export namespace LayerOrder {
    export const TERRAIN_PATH = 1;
    export const BONUS_PATH_LAYER = 2;
}

const DEBUG = document.location.pathname.includes("localhost");

interface GizmoSettings {
    enable: boolean;
    sprite?: boolean;
    capsule?: boolean;
    collision?: boolean;
}

export class Game {

    public main: HTMLElement;
    public stage: Stage;
    public canvas: Canvas;
    public resources: Resources;
    public player: Player;
    public terrain: Terrain2D;
    public terrainPath: TerrainPath;
    public gameController: GameController;
    public enemySpawn: EnemySpawn;
    public bountySpawn: BountySpawn;

    /** Global gizmo rendering configuration. */
    public readonly gizmos: GizmoSettings = {
        enable: false,
        sprite: false,
        capsule: false,
        collision: false,
    };

    constructor() {
        this.stage = new Stage();

        this.main = document.getElementsByTagName("main")[0] as HTMLElement;
        this.canvas = this.stage.createActor("canvas").add(Canvas);
        this.canvas.element = document.createElement("canvas");
        this.main.appendChild(this.canvas.element);
        document.body.appendChild(this.main);

        this.stage.addSystem(new UpdateSystem());
        this.stage.addSystem(new LateUpdateSystem());
        this.stage.addSystem(this.initCollisionSystem());
        this.stage.addSystem(new DrawSystem(this.canvas));

        this.initGizmo();
        this.stage.createActor("FPS").add(FPS);
        this.resources = this.stage.createActor("resources").add(Resources);
        this.resources.baseUrl = "img";

        this.terrain = this.initTerrain();
        this.terrainPath = this.initTerrainPath(this.terrain);
        this.player = this.initPlayer(this.terrain);
        this.enemySpawn = this.initEnemySpawn(this.terrain);
        this.bountySpawn = this.initBountySpawn();
        this.gameController = this.initGameController();
        this.initUI();
    }

    initCollisionSystem(): CollisionSystem2D {
        const collision = new CollisionSystem2D();
        collision.enableLayerCollision(Layers.PLAYER, Layers.ENEMY);
        collision.enableLayerCollision(Layers.PLAYER, Layers.BOUNTY);
        return collision;
    }

    initTerrain(): Terrain2D {
        const actor = this.stage.createActor();
        const terrain = actor.add(Terrain2D);

        // layer
        const layer = actor.require(Layer);
        layer.set(Layers.TERRAIN);

        // terrain size
        const baseLayerRows = [
            "stone-block.png",
            "grass-block.png",
            "grass-block.png",
            "grass-block.png",
            "grass-block.png",
            "grass-block.png",
            "grass-block.png",
            "stone-block.png",
        ];
        terrain.setTileRect(0, 51, 101, 83);
        terrain.setGridSize(5, baseLayerRows.length);

        // canvas size
        this.canvas.size.x = terrain.width;
        this.canvas.size.y = terrain.height + terrain.tile.yMin + 40;

        // initialize base layer
        const baseLayer = terrain.createLayer();
        for (let i = 0; i < baseLayerRows.length; i++)
            baseLayer.setTileRow(i, this.resources.load(baseLayerRows[i]));

        return terrain;
    }

    initTerrainPath(terrain: Terrain2D): TerrainPath {
        const layer = terrain.createLayer();
        layer.setOrder(LayerOrder.TERRAIN_PATH);
        const terrainPath = new TerrainPath();
        terrainPath.image = this.resources.load("stone-block.png");
        terrainPath.layer = layer;
        return terrainPath;
    }

    initPlayer(terrain: Terrain2D): Player {
        const actor = this.stage.createActor("player");
        const player = actor.add(Player);

        // layer
        const layer = actor.require(Layer);
        layer.set(Layers.PLAYER);

        // controller
        const controller = actor.add(PlayerControls);
        controller.terrain = terrain;
        controller.walkable.add("stone-block.png");
        controller.player = player;
        controller.canvas = this.canvas;

        // collider
        const capsule = actor.add(CapsuleCollider2D);
        capsule.setSize(60, 50);
        capsule.setOffset(20.5, 65);

        return player;
    }

    initEnemySpawn(terrain: Terrain2D): EnemySpawn {
        const actor = this.stage.createActor("enemy-spawn");
        const spawn = actor.add(EnemySpawn);
        spawn.terrain = terrain;
        spawn.yTileRange = {min: 1, max: terrain.size.y - 2};

        spawn.enemyFactory = () => {
            const actor = this.stage.createActor("enemy");
            const enemy = actor.require(Enemy);
            enemy.view = actor.require(View);
            enemy.view.resources = this.resources;
            enemy.view.setImage("enemy-bug.png");
            enemy.motor = actor.require(Motor);
            enemy.layer.set(Layers.ENEMY);

            // collider
            const capsule = actor.require(CapsuleCollider2D);
            capsule.setSize(98, 50);
            capsule.setOffset(2, 65);

            return enemy;
        };
        return spawn;
    }

    initBountySpawn(): BountySpawn {
        const actor = this.stage.createActor("bounty-spawn");
        const bountySpawn = actor.add(BountySpawn);
        bountySpawn.terrainPath = this.terrainPath;
        bountySpawn.bonusPathLayer = this.terrain.createLayer();
        bountySpawn.bonusPathLayer.setOrder(LayerOrder.BONUS_PATH_LAYER);

        const {size} = this.terrain;
        bountySpawn.spots.push({x: 0, y: 2});
        bountySpawn.spots.push({x: 0, y: size.y - 3});
        bountySpawn.spots.push({x: size.x - 1, y: 2});
        bountySpawn.spots.push({x: size.x - 1, y: size.y - 3});

        bountySpawn.bountyFactory = () => {
            const {tile} = this.terrain;
            const actor = this.stage.createActor("bounty");
            const bounty = actor.add(Bounty);
            bounty.layer.set(Layers.BOUNTY);
            const collider = actor.add(CapsuleCollider2D);
            collider.setSize(20, 20);
            collider.setPivot(0, 0);
            collider.setOffset(tile.xMin + tile.width * .5, tile.yMin + tile.height * .5);

            bounty.highlight.imageName = "selector.png";
            bounty.highlight.view.sprite.offset.y = -0.23;
            bounty.highlight.view.sprite.order = -1;
            return bounty;
        };
        return bountySpawn;
    }

    initGameController(): GameController {
        const actor = this.stage.createActor("game");
        const controller = actor.add(GameController);
        controller.terrain = this.terrain;
        controller.terrainPath = this.terrainPath;
        controller.bountySpawn = this.bountySpawn;
        return controller;
    }

    initUI(): void {
        this.initStatsView();
        this.initOverlayView();
        this.initGameOverDialog();
        this.initHowToPlayDialog();
        this.initCinematicScene();
        this.initMainMenuDialog();
        if (DEBUG) this.initDebugView();
    }

    initStatsView(): StatsView {
        const actor = this.stage.createActor("stats-view");
        const view = actor.add(StatsView);
        return view;
    }

    initOverlayView(): OverlayView {
        const actor = this.stage.createActor("overlay-view");
        const view = actor.add(OverlayView);
        return view;
    }

    initMainMenuDialog(): MainMenuDialog {
        const actor = this.stage.createActor("main-menu-dialog");
        const view = actor.add(MainMenuDialog);
        return view;
    }

    initGameOverDialog(): GameOverDialog {
        const actor = this.stage.createActor("game-over-dialog");
        const view = actor.add(GameOverDialog);
        return view;
    }

    initHowToPlayDialog(): HowToPlayDialog {
        const actor = this.stage.createActor("how-to-play-dialog");
        const view = actor.add(HowToPlayDialog);
        return view;
    }

    initCinematicScene(): CinematicScene {
        const actor = this.stage.createActor("cinematic-scene");
        const view = actor.add(CinematicScene);
        return view;
    }

    initDebugView(): void {
        const actor = this.stage.createActor("debug-view");
        const view = actor.add(DifficultyView);
    }

    initGizmo(force?: boolean) {
        if (!this.isGizmoActive() && !force)
            return;

        const {gizmos} = this;
        this.stage.addSystem(new GizmoSystem(this.canvas));
        if (gizmos.sprite) Sprite.prototype.gizmo = gizmos.sprite;
        if (gizmos.capsule) CapsuleCollider2D.prototype.gizmo = gizmos.capsule;
        if (gizmos.collision) CollisionSystem2D.prototype.gizmo = gizmos.collision;
    }

    isGizmoActive(): boolean {
        for (const key in this.gizmos)
            if (this.gizmos[key])
                return true;
    }

    start() {
        this.stage.start();
    }
}

const game = new Game();
game.start();
