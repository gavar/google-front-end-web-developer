import {Resources, Terrain2D} from "$components";
import {Stage} from "$engine";
import {EnemySpawn, Player, PlayerController} from "$game";
import {DrawSystem, LateUpdateSystem, UpdateSystem} from "$systems";

export class Game {

    readonly stage: Stage;
    readonly canvas: HTMLCanvasElement;
    readonly resources: Resources;

    constructor() {
        this.canvas = document.createElement("canvas");

        this.stage = new Stage();
        this.stage.addSystem(new UpdateSystem());
        this.stage.addSystem(new LateUpdateSystem());
        this.stage.addSystem(new DrawSystem(this.canvas));

        this.resources = this.stage.createActor("resources").add(Resources);

        const terrain = this.initTerrain();
        const player = this.initPlayer();
        const enemySpawn = this.initEnemySpawn(terrain);
    }

    initTerrain(): Terrain2D {

        const images = [
            "stone-block.png",
            "grass-block.png",
            "grass-block.png",
            "grass-block.png",
            "grass-block.png",
            "stone-block.png",
        ];

        const actor = this.stage.createActor();
        const terrain = actor.add(Terrain2D);

        // terrain size
        terrain.setTileSize(101, 83);
        const size = terrain.setGridSize(6, 6);

        // canvas size
        this.canvas.width = terrain.width;
        this.canvas.height = terrain.height + 90;

        // load images
        for (let i = 0; i < size.y; i++)
            terrain.setImageRow(i, this.resources.load(images[i]));

        // offset for properly displaying characters
        terrain.offset.y = -30;

        return terrain;
    }

    initPlayer(): Player {
        const actor = this.stage.createActor("player");
        const player = actor.add(Player);
        const controller = actor.add(PlayerController);
        return player;
    }

    initEnemySpawn(terrain: Terrain2D): EnemySpawn {
        const actor = this.stage.createActor("enemy-spawn");
        const spawn = actor.add(EnemySpawn);
        spawn.terrain = terrain;
        spawn.enemyImageName = "enemy-bug.png";
        spawn.enemyVelocity = 150;
        spawn.enemyLimit = 10;
        spawn.yTileRange = {min: 1, max: terrain.size.y - 2};
        spawn.delay = 1;
        return spawn;
    }

    start() {
        document.body.appendChild(this.canvas);
        this.stage.start();
    }
}

(function () {
    const game = new Game();
    game.start();
}());


