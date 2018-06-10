import {Layer, Motor, Resources, Terrain2D, Transform} from "$components";
import {Stage} from "$engine";
import {Enemy, EnemySpawn, Player, PlayerController, TerrainPath, View} from "$game";
import {CapsuleCollider2D, CollisionSystem2D} from "$physics";
import {DrawSystem, GizmoSystem, LateUpdateSystem, UpdateSystem} from "$systems";

export namespace Layers {
    export const TERRAIN = 1;
    export const PLAYER = 2;
    export const ENEMY = 3;
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
    public canvas: HTMLCanvasElement;
    public resources: Resources;
    public player: Player;

    /** Global gizmo rendering configuration. */
    public readonly gizmos: GizmoSettings = {
        enable: false,
        capsule: false,
        collision: true,
    };

    constructor() {
        this.canvas = document.createElement("canvas");

        this.stage = new Stage();
        this.stage.addSystem(new UpdateSystem());
        this.stage.addSystem(new LateUpdateSystem());
        this.stage.addSystem(this.initCollisionSystem());
        this.stage.addSystem(new DrawSystem(this.canvas));

        this.initGizmo();
        this.resources = this.stage.createActor("resources").add(Resources);

        const terrain = this.initTerrain();
        const terrainPath = this.initTerrainPath(terrain);
        this.player = this.initPlayer(terrain);
        const enemySpawn = this.initEnemySpawn(terrain);

        terrainPath.generate(this.player.actor.get(Transform).position, 5);
    }

    initCollisionSystem(): CollisionSystem2D {
        const collision = new CollisionSystem2D();
        collision.enableLayerCollision(Layers.PLAYER, Layers.ENEMY);
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
            "stone-block.png",
        ];
        terrain.setTileRect(0, 51, 101, 83);
        terrain.setGridSize(baseLayerRows.length, baseLayerRows.length);

        // canvas size
        this.canvas.width = terrain.width;
        this.canvas.height = terrain.size.y * 171;

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
        spawn.enemyLimit = 1000;
        spawn.yTileRange = {min: 1, max: terrain.size.y - 2};
        spawn.delay = .1;

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

    initGizmo() {
        if (!this.isGizmoActive())
            return;

        const {gizmos} = this;
        this.stage.addSystem(new GizmoSystem(this.canvas));
        if (gizmos.capsule) CapsuleCollider2D.prototype.gizmo = gizmos.capsule;
        if (gizmos.collision) CollisionSystem2D.prototype.gizmo = gizmos.collision;
    }

    isGizmoActive(): boolean {
        for (const key in this.gizmos)
            if (this.gizmos[key])
                return true;
    }

    start() {
        document.body.appendChild(this.canvas);
        this.stage.start();
    }
}

const game = new Game();
game.start();

