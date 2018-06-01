import {Terrain2D, Transform} from "$components";
import {Actor, Component} from "$engine";

/**
 * Controls the player movement, by reacting on input events.
 */
export class PlayerController implements Component, EventListenerObject {

    public terrain: Terrain2D;
    public transform: Transform;

    /** @inheritDoc */
    readonly actor: Actor;

    /** @inheritDoc */
    awake() {
        this.transform = this.actor.require(Transform);
    }

    /** @inheritDoc */
    start() {
        document.addEventListener("keydown", this);
        this.terrain = this.terrain || this.actor.stage.findComponentOfType(Terrain2D);
        this.transform.position.x = this.terrain.positionX(0);
        this.transform.position.y = this.terrain.positionY(0);
    }

    /** @inheritDoc */
    destroy() {
        document.removeEventListener("keydown", this);
    }

    /** @inheritDoc */
    handleEvent(e: Event): void {
        switch (e.type) {
            case "keydown":
                this.onKeyDown(e as KeyboardEvent);
                break;
        }
    }

    private onKeyDown(e: KeyboardEvent) {
        switch (e.code) {
            case "KeyW":
            case "ArrowUp":
                this.moveBy(0, -1);
                break;

            case "KeyA":
            case "ArrowLeft":
                this.moveBy(-1, 0);
                break;

            case "KeyS":
            case "ArrowDown":
                this.moveBy(0, 1);
                break;

            case "KeyD":
            case "ArrowRight":
                this.moveBy(1, 0);
                break;
        }
    }

    private moveBy(x: number, y: number) {
        const {transform, terrain} = this;
        const position = transform.position;
        const size = terrain.size;

        if (x) {
            x += terrain.tileX(position.x);
            x = Math.max(0, x);
            x = Math.min(x, size.x - 1);
            position.x = terrain.positionX(x);
        }

        if (y) {
            y += terrain.tileY(position.y);
            y = Math.max(0, y);
            y = Math.min(y, size.y - 1);
            position.y = terrain.positionY(y);
        }
    }
}
