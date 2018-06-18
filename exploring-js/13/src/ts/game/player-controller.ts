import {Canvas, Terrain2D, Vector2} from "$components";
import {Actor, Component} from "$engine";
import {Mathf, Player} from "$game";
import {LateUpdate} from "$systems";

/**
 * Controls the player movement, by reacting on input events.
 * TODO: rename to PlayerControls
 */
export class PlayerController implements Component, EventListenerObject, LateUpdate {

    private touches: TouchList;
    private mouse: MouseEvent;
    private keys: Set<string> = new Set<string>();
    private readonly direction: Vector2 = {x: 0, y: 0};

    private moveDelay = 0.02; // 20 ms;
    private moveCountDown = 0;

    public position: Vector2 = {x: 0, y: 0};
    private velocity: Vector2 = {x: 0, y: 0};

    public player: Player; // TODO: replace with transform
    public terrain: Terrain2D;
    public canvas: Canvas;
    public smoothTime: number = 0.15;

    /** @inheritDoc */
    readonly actor: Actor;

    /** @inheritDoc */
    readonly enabled?: boolean;

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
        this.player = this.player || this.actor.stage.findComponentOfType(Player);
        this.canvas = this.canvas || this.actor.stage.findComponentOfType(Canvas);
        this.terrain = this.terrain || this.actor.stage.findComponentOfType(Terrain2D);

        const OPTIONS: AddEventListenerOptions = {passive: false};

        // touch
        document.addEventListener("touchstart", this, OPTIONS);
        document.addEventListener("touchend", this, OPTIONS);
        document.addEventListener("touchcancel", this, OPTIONS);
        document.addEventListener("touchmove", this, OPTIONS);

        // mouse
        document.addEventListener("mousedown", this, OPTIONS);
        document.addEventListener("mousemove", this, OPTIONS);
        document.addEventListener("mouseup", this, OPTIONS);

        // keys
        document.addEventListener("keydown", this, OPTIONS);
        document.addEventListener("keyup", this, OPTIONS);

        this.position.x = this.player.transform.position.x;
        this.position.y = this.player.transform.position.y;
        this.velocity.x = this.velocity.y = 0;
    }

    /** @inheritDoc */
    lateUpdate(deltaTime: number): void {
        this.moveCountDown -= deltaTime;
        if (this.moveCountDown < 0) {
            this.moveCountDown = this.moveDelay;
            this.move();
        }

        Vector2.smooth(this.player.transform.position, this.position, this.velocity, this.smoothTime, deltaTime);
    }

    /** @inheritDoc */
    destroy() {
        // touch
        document.removeEventListener("touchstart", this);
        document.removeEventListener("touchend", this);
        document.removeEventListener("touchcancel", this);
        document.removeEventListener("touchmove", this);

        // mouse
        document.removeEventListener("mousedown", this);
        document.removeEventListener("mousemove", this);
        document.removeEventListener("mouseup", this);

        // keys
        document.removeEventListener("keydown", this);
        document.removeEventListener("keyup", this);
    }

    /** @inheritDoc */
    handleEvent(e: Event): void {
        // touch?
        switch (e.type) {
            case "touchstart":
            case "touchmove":
            case "touchend":
            case "touchcancel":
                this.moveCountDown = 0;
                this.touches = (e as TouchEvent).touches;
                e.preventDefault();
                break;
        }

        // mouse?
        switch (e.type) {
            case "mousedown":
                this.moveCountDown = 0;
                this.mouse = e as MouseEvent;
                break;
            case "mousemove":
                if (this.mouse)
                    this.mouse = e as MouseEvent;
                break;
            case "mouseup":
                this.mouse = null;
                break;
        }

        // key?
        switch (e.type) {
            case "keydown":
                if (this.onKey((e as KeyboardEvent).code, true))
                    this.moveCountDown = 0;
                break;
            case "keyup":
                this.onKey((e as KeyboardEvent).code, false);
                break;
        }
    }

    /**
     * Process key-press event.
     * @param code - key code.
     * @param down - whether key is down or not.
     * @return true if direction changed; false otherwise.
     */
    private onKey(code: string, down: boolean): boolean {
        let x = 0, y = 0;
        const delta: number = down ? 1 : -1;
        switch (code) {
            case "KeyW":
            case "ArrowUp":
                y += -delta;
                break;

            case "KeyA":
            case "ArrowLeft":
                x += -delta;
                break;

            case "KeyS":
            case "ArrowDown":
                y += delta;
                break;

            case "KeyD":
            case "ArrowRight":
                x += delta;
                break;

            default:
                return false;
        }

        if (this.submitKey(code, down)) {
            this.direction.x += x;
            this.direction.y += y;
            return true;
        }

        return false;
    }

    /**
     * Update key state in internal registry of active keys.
     * @param key - key code to add.
     * @param down - whether key is down.
     * @return true if key state modified; false otherwise.
     */
    private submitKey(key: string, down: boolean) {
        const {keys} = this;
        return down
            ? !keys.has(key) && keys.add(key)
            : keys.delete(key);
    }

    /**
     * Automatically move player by any active input source.
     * @return true when moved in any direction; false otherwise.
     */
    private move() {
        // move by touch?
        const {touches} = this;
        if (touches && touches.length)
            if (this.moveByCursor(touches[0]))
                return true;

        // move by mouse?
        const {mouse} = this;
        if (mouse && this.moveByCursor(mouse))
            return true;

        // move by key?
        const {direction} = this;
        if (this.moveByDirection(direction))
            return true;

        return false;
    }

    /**
     * Move character by client X, Y coordinates provided by a given cursor.
     * @param cursor - cursor providing client X, Y coordinates.
     * @return true when moved in any direction; false otherwise.
     */
    private moveByCursor(cursor: Touch | MouseEvent): boolean {
        const rect = this.canvas.element.getBoundingClientRect() as DOMRect;
        return this.moveToPoint(cursor.clientX - rect.x, cursor.clientY - rect.y);
    }

    /**
     * Move character in direction to a given world point.
     * Character can move only by a single axis at one time.
     * @param x - 'X' axis value in world coordinates.
     * @param y - 'Y' axis value in world coordinates.
     * @return true when moved in any direction; false otherwise.
     */
    private moveToPoint(x: number, y: number): boolean {
        const {terrain} = this;
        const {scale} = this.canvas.transform;
        const {position} = this.player.transform;

        x /= scale.x;
        y /= scale.y;

        x -= terrain.tile.xMin;
        y -= terrain.tile.yMin;

        const x1 = terrain.rowByPosX(position.x);
        const y1 = terrain.colByPosY(position.y);

        const x2 = terrain.rowByPosX(x);
        const y2 = terrain.colByPosY(y);

        const dx = Math.floor(x2) - Math.floor(x1 + .5);
        const dy = Math.floor(y2) - Math.floor(y1 + .5);

        // move only by single axis
        return dx && dy && Math.abs(x2 - x1) > Math.abs(y2 - y1)
            ? this.moveBy(dx, 0) || this.moveBy(0, dy)
            : this.moveBy(0, dy) || this.moveBy(dx, 0);
    }

    /**
     * Move character by direction provided by a given vector.
     * Character can move only by a single axis at one time.
     * @param direction - direction where to move character
     * @return true when moved in any direction; false otherwise.
     */
    private moveByDirection(direction: Vector2): boolean {
        // move only by single axis
        const {x, y} = direction;
        return x && y && Math.abs(x) > Math.abs(y)
            ? this.moveBy(x, 0) || this.moveBy(0, y)
            : this.moveBy(0, y) || this.moveBy(x, 0);
    }

    /**
     * Move character by X / Y tiles count.
     * Character can move only by single tile at one time.
     * @param x - how much tiles to move by 'X' axis.
     * @param y - how much tiles to move by 'Y' axis.
     * @return true when moved in any direction; false otherwise.
     */
    private moveBy(x: number, y: number): boolean {
        if (!x && !y)
            return false;

        // normalize
        x = Mathf.clamp(x, -1, 1);
        y = Mathf.clamp(y, -1, 1);

        const {terrain} = this;
        const {size} = terrain;
        const {position} = this.player.transform;

        // calculate next tile X
        let tileX = Math.round(terrain.rowByPosX(position.x));
        tileX = Mathf.clamp(tileX + x, 0, size.x - 1);

        // calculate next tile Y
        let tileY = Math.round(terrain.colByPosY(position.y));
        tileY = Mathf.clamp(tileY + y, 0, size.y - 1);

        // X, Y absolute positions
        x = terrain.positionX(tileX);
        y = terrain.positionY(tileY);

        // ensure tile by next position is walkable
        if (this.walkable.size > 0) {
            const image = terrain.raycast(x, y);
            const imageName = image && image.name;
            if (!this.walkable.has(imageName))
                return false;
        }

        // apply position
        this.position.x = x;
        this.position.y = y;
        return true;
    }
}
