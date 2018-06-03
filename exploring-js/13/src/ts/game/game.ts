import {Motor, Resources, Sort, Terrain2D, Transform} from "$components";
import {Stage} from "$engine";
import {Enemy, EnemySpawn, Player, PlayerController, TerrainPath, View} from "$game";
import {DrawSystem, GizmoSystem, LateUpdateSystem, UpdateSystem} from "$systems";

export namespace Layer {
    export const TERRAIN = 1;
    export const PLAYER = 2;
    export const ENEMY = 3;
}

export namespace LayerOrder {
    export const TERRAIN_PATH = 1;
}

export class Game {

    public stage: Stage;
    public canvas: HTMLCanvasElement;
    public resources: Resources;
    public player: Player;

    constructor() {
        this.canvas = document.createElement("canvas");

        this.stage = new Stage();
        this.stage.addSystem(new UpdateSystem());
        this.stage.addSystem(new LateUpdateSystem());
        this.stage.addSystem(new DrawSystem(this.canvas));
        this.stage.addSystem(new GizmoSystem(this.canvas));

        this.resources = this.stage.createActor("resources").add(Resources);

        const terrain = this.initTerrain();
        const terrainPath = this.initTerrainPath(terrain);
        this.player = this.initPlayer(terrain);
        const enemySpawn = this.initEnemySpawn(terrain);
    }

    initTerrain(): Terrain2D {
        const actor = this.stage.createActor();
        const terrain = actor.add(Terrain2D);

        // layer
        const sort = actor.require(Sort);
        sort.layer = Layer.TERRAIN;

        // terrain size
        terrain.setTileSize(101, 83);
        const size = terrain.setGridSize(6, 6);

        // canvas size
        this.canvas.width = terrain.width;
        this.canvas.height = terrain.height + 90;

        // initialize base layer
        const baseLayer = terrain.createLayer();
        const baseLayerRows = [
            "stone-block.png",
            "grass-block.png",
            "grass-block.png",
            "grass-block.png",
            "grass-block.png",
            "stone-block.png",
        ];
        for (let i = 0; i < baseLayerRows.length; i++)
            baseLayer.setTileRow(i, this.resources.load(baseLayerRows[i]));

        // offset for properly displaying objects
        terrain.offset.y = 20;

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
        const sort = actor.require(Sort);
        sort.layer = Layer.PLAYER;

        // controller
        const controller = actor.add(PlayerController);
        controller.terrain = terrain;
        controller.walkable.add("stone-block.png");

        // collider
        const capsule = actor.add(CapsuleCollider2D);
        capsule.setSize(67, 76);
        capsule.setOffset(17, 63);

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
            enemy.sort.layer = Layer.ENEMY;

            // collider
            const capsule = actor.add(CapsuleCollider2D);
            capsule.setSize(98, 66);
            capsule.setOffset(2, 77);

            return enemy;
        };
        return spawn;
    }

    start() {
        document.body.appendChild(this.canvas);
        this.stage.start();
    }
}

const game = new Game();
game.start();

