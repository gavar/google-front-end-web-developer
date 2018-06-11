import {CanvasScaler, Layer, Motor, Resources, Terrain2D} from "$components";
import {Stage} from "$engine";
import {
    Bounty,
    BountySpawn,
    Enemy,
    EnemySpawn,
    GameController,
    Player,
    PlayerController,
    TerrainPath,
    View,
} from "$game";
import {CapsuleCollider2D, CollisionSystem2D} from "$physics";
import {DrawSystem, GizmoSystem, LateUpdateSystem, UpdateSystem} from "$systems";

export namespace Layers {
    export const TERRAIN = 1;
    export const BOUNTY = 2;
    export const PLAYER = 3;
    export const ENEMY = 4;
}

export namespace LayerOrder {
    export const TERRAIN_PATH = 1;
}

interface GizmoSettings {
    enable: boolean;
    capsule?: boolean;
    collision?: boolean;
}

export class Game {

    public stage: Stage;
    public scaler: CanvasScaler;
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
        capsule: false,
        collision: true,
    };

    constructor() {
        this.stage = new Stage();

        this.scaler = this.stage.createActor("canvas-scale").add(CanvasScaler);
        this.scaler.canvas = document.createElement("canvas");
        this.scaler.padding.x = 20;

        this.stage.addSystem(new UpdateSystem());
        this.stage.addSystem(new LateUpdateSystem());
        this.stage.addSystem(this.initCollisionSystem());
        this.stage.addSystem(new DrawSystem(this.scaler.canvas, this.scaler.scale));

        this.initGizmo();
        this.resources = this.stage.createActor("resources").add(Resources);

        this.terrain = this.initTerrain();
        this.terrainPath = this.initTerrainPath(this.terrain);
        this.player = this.initPlayer(this.terrain);
        this.enemySpawn = this.initEnemySpawn(this.terrain);
        this.bountySpawn = this.initBountySpawn();
        this.gameController = this.initGameController();
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
        this.scaler.size.x = terrain.width;
        this.scaler.size.y = terrain.height + terrain.tile.yMin + 40;

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
        const controller = actor.add(PlayerController);
        controller.terrain = terrain;
        controller.walkable.add("stone-block.png");
        controller.player = player;
        controller.canvasScale = this.scaler;

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
        spawn.enemyVelocity = 150;
        spawn.enemyLimit = 20;
        spawn.yTileRange = {min: 1, max: terrain.size.y - 2};
        spawn.delay = 1;

        spawn.enemyFactory = () => {
            const actor = this.stage.createActor("enemy");
            const enemy = actor.add(Enemy);
            enemy.view = actor.add(View);
            enemy.view.resources = this.resources;
            enemy.view.setImage("enemy-bug.png");
            enemy.motor = actor.add(Motor);
            enemy.layer.set(Layers.ENEMY);

            // collider
            const capsule = actor.add(CapsuleCollider2D);
            capsule.setSize(98, 50);
            capsule.setOffset(2, 65);

            return enemy;
        };
        return spawn;
    }

    initBountySpawn(): BountySpawn {
        const actor = this.stage.createActor("bounty-spawn");
        const bountySpawn = actor.add(BountySpawn);
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
            bounty.highlight.view.sprite.offset.y = -40;
            bounty.highlight.view.sprite.order = -1;
            return bounty;
        };
        return bountySpawn;
    }

    initGameController(): GameController {
        const actor = this.stage.createActor("game");
        const controller = actor.add(GameController);
        controller.player = this.player;
        controller.terrain = this.terrain;
        controller.terrainPath = this.terrainPath;
        controller.bountySpawn = this.bountySpawn;
        return controller;
    }

    initGizmo() {
        if (!this.isGizmoActive())
            return;

        const {gizmos} = this;
        this.stage.addSystem(new GizmoSystem(this.scaler.canvas, this.scaler.scale));
        if (gizmos.capsule) CapsuleCollider2D.prototype.gizmo = gizmos.capsule;
        if (gizmos.collision) CollisionSystem2D.prototype.gizmo = gizmos.collision;
    }

    isGizmoActive(): boolean {
        for (const key in this.gizmos)
            if (this.gizmos[key])
                return true;
    }

    start() {
        document.body.appendChild(this.scaler.canvas);
        this.stage.start();
    }
}

const game = new Game();
game.start();
