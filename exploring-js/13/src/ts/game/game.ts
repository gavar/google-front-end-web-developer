import {Resources, Terrain2D} from "$components";
import {Stage} from "$engine";
import {Player, PlayerController} from "$game";
import {DrawSystem, UpdateSystem} from "$systems";

export class Game {

    readonly stage: Stage;
    readonly canvas: HTMLCanvasElement;
    readonly resources: Resources;

    constructor() {
        this.canvas = document.createElement("canvas");

        this.stage = new Stage();
        this.stage.addSystem(new UpdateSystem());
        this.stage.addSystem(new DrawSystem(this.canvas));

        this.resources = this.stage.createActor("resources").add(Resources);

        this.initTerrain();
        this.initPlayer();

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
        for (let i = 0; i < size.y; i++) {
            this.resources.load(images[i]).then(image => {
                terrain.setImageRow(i, image);
            });
        }

        // offset for properly displaying characters
        terrain.offset.y = -40;

        return terrain;
    }

    initPlayer() {
        const actor = this.stage.createActor("player");
        const player = actor.add(Player);
        const controller = actor.add(PlayerController);
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


