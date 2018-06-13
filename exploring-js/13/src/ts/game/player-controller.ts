import {CanvasScaler, Terrain2D, Vector2} from "$components";
import {Actor, Component} from "$engine";
import {Player} from "$game";
import {LateUpdate} from "$systems";

/**
 * Controls the player movement, by reacting on input events.
 */
export class PlayerController implements Component, EventListenerObject, LateUpdate {

    private velocity: Vector2 = {x: 0, y: 0};
    public position: Vector2 = {x: 0, y: 0};

    public player: Player;
    public terrain: Terrain2D;
    public root: CanvasScaler;
    public smoothTime: number = 0.15;

    /** @inheritDoc */
    readonly actor: Actor;

    /** Set of walkable tiles. */
    public walkable: Set<string> = new Set<string>();

    /**
     * Set player's position immediately.
     */
    applyPosition(x: number, y: number) {
        this.player.transform.position.x = this.position.x = x;
        this.player.transform.position.y = this.position.y = y;
        this.velocity.x = this.velocity.y = 0;
    }

    /** @inheritDoc */
    start() {
        this.root = this.root || this.actor.stage.findComponentOfType(CanvasScaler);
        this.terrain = this.terrain || this.actor.stage.findComponentOfType(Terrain2D);
        document.addEventListener("click", this);
        document.addEventListener("keydown", this);
        document.addEventListener("dblclick", this);
        document.addEventListener("touchend", this);
        document.addEventListener("touchmove", this);

        this.position.x = this.player.transform.position.x;
        this.position.y = this.player.transform.position.y;
        this.velocity.x = this.velocity.y = 0;
    }

    /** @inheritDoc */
    lateUpdate(deltaTime: number): void {
        Vector2.smooth(this.player.transform.position, this.position, this.velocity, this.smoothTime, deltaTime);
    }

    /** @inheritDoc */
    destroy() {
        document.removeEventListener("click", this);
        document.removeEventListener("keydown", this);
        document.removeEventListener("dblclick", this);
        document.removeEventListener("touchend", this);
        document.removeEventListener("touchmove", this);
    }

    /** @inheritDoc */
    handleEvent(e: Event): void {
        const rect = this.root.canvas.getBoundingClientRect() as DOMRect;

        switch (e.type) {
            case "click":
            case "dblclick":
            case "touchend":
            case "touchmove":
                e.preventDefault();
                break;
        }

        switch (e.type) {
            case "keydown":
                this.onKeyDown(e as KeyboardEvent);
                break;
            case "touchend":
                const touch = (e as TouchEvent).changedTouches[0];
                this.onClick(touch.clientX - rect.x, touch.clientY - rect.y);
                break;
            case "click":
                const mouse = e as MouseEvent;
                this.onClick(mouse.clientX - rect.x, mouse.clientY - rect.y);
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

    private onClick(x: number, y: number) {
        const {terrain, player} = this;
        const {scale} = this.root.transform;

        x /= scale.x;
        y /= scale.y;

        x -= terrain.tile.xMin;
        y -= terrain.tile.yMin;

        let byX = terrain.rowByPosX(x) - terrain.rowByPosX(player.transform.position.x);
        let byY = terrain.colByPosY(y) - terrain.colByPosY(player.transform.position.y);

        const dx = byX <= 0 ? -1 : byX >= 1 ? 1 : 0;
        const dy = byY <= 0 ? -1 : byY >= 1 ? 1 : 0;

        // move only by single axis
        if (Math.abs(byX) > Math.abs(byY))
            this.moveBy(dx, 0) || this.moveBy(0, dy);
        else
            this.moveBy(0, dy) || this.moveBy(dx, 0);
    }

    private moveBy(x: number, y: number): boolean {
        if (!x && !y)
            return false;

        const {terrain, position} = this;
        const {size} = terrain;

        // calculate next position X
        x += terrain.rowByPosX(position.x);
        x = Math.max(0, x);
        x = Math.min(x, size.x - 1);
        x = terrain.positionX(x);

        // calculate next position Y
        y += terrain.colByPosY(position.y);
        y = Math.max(0, y);
        y = Math.min(y, size.y - 1);
        y = terrain.positionY(y);

        // ensure tile by next position is walkable
        if (this.walkable.size > 0) {
            const image = terrain.raycast(x, y);
            if (!this.walkable.has(image.name))
                return false;
        }

        // apply position
        position.x = x;
        position.y = y;
        return true;
    }
}
