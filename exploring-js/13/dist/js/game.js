/**
 * Randomization library.
 */
class Random {
    /**
     * Get random number within given range.
     * @param min - minimum number inclusive.
     * @param max - maximum number exclusive.
     */
    static range(min, max) {
        return min + (max - min) * Math.random();
    }
    /**
     * Get random integer number within given range.
     * @param min - minimum number inclusive.
     * @param max - maximum number exclusive.
     */
    static rangeInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return min + Math.floor((max - min) * Math.random());
    }
    /**
     * Get random deviation within given tolerance.
     * @param {number} tolerance - maximum offset from 1.
     */
    static deviation(tolerance) {
        return 1 + (Math.random() - 0.5) * 2 * tolerance;
    }
    /** Shuffle array of items. */
    static shuffle(array) {
        let temp, j;
        for (let i = array.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }
}
/**
 * Math functions library.
 */
class Mathf {
    /**
     * Gradually change towards a destination value over time.
     * @param now - current value.
     * @param to - destination value.
     * @param velocityObject - container storing current velocity value (modified by this func).
     * @param velocityKey - name of the property in container to use for storing velocity value.
     * @param smoothTime - approx time of achieving destination value.
     * @param deltaTime - time since last call of this function.
     * @param velocityLimit - maximum velocity.
     * @return value to apply to current value.
     * @see https://github.com/Unity-Technologies/UnityCsReference/blob/11bcfd801fccd2a52b09bb6fd636c1ddcc9f1705/Runtime/Export/Mathf.cs#L303
     */
    static smooth(now, to, velocityObject, velocityKey, smoothTime, deltaTime, velocityLimit = Number.POSITIVE_INFINITY) {
        const o = 2 / smoothTime;
        const x = o * deltaTime;
        const e = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
        let delta = now - to;
        const destination = to;
        const max = velocityLimit * smoothTime;
        delta = Math.max(-max, delta);
        delta = Math.min(delta, max);
        to = now - delta;
        let velocity = velocityObject[velocityKey];
        let temp = (velocity + o * delta) * deltaTime;
        velocity = (velocity - o * temp) * e;
        let next = to + (delta + temp) * e;
        if (destination - now > 0 === next > destination) {
            next = destination;
            velocity = (next - destination) / deltaTime;
        }
        velocityObject[velocityKey] = velocity;
        return next;
    }
    /**
     * Clamp value between min and max values.
     * @param value - value to clamp.
     * @param min - value lower limit.
     * @param max - value upper limit.
     */
    static clamp(value, min, max) {
        if (value >= max)
            return max;
        if (value <= min)
            return min;
        return value;
    }
}

// TODO: move events to related classes
class GameEvents {
}
GameEvents.PROPERTY_CHANGED = "property-changed";
GameEvents.PLAYER_DIE = "player-die";
GameEvents.PLAYER_HIT = "player-hit";
GameEvents.PLAYER_ENEMY_COLLISION = "player-enemy-collision";
GameEvents.PLAYER_BOUNTY_COLLISION = "player-bounty-collision";

/**
 * View controls image of a {@link Sprite}.
 */
class View {
    /**
     * Set image to display.
     * @param name - name of the image to display.
     */
    setImage(name) {
        if (name) {
            this.resources = this.resources || this.actor.stage.findComponentOfType(Resources);
            this.resources.load(name, this.onImageLoaded, this);
        }
        else {
            this.sprite.image = null;
        }
    }
    /** @inheritDoc */
    awake() {
        this.sprite = this.actor.add(Sprite);
    }
    /** @inheritDoc */
    destroy() {
        this.actor.remove(this.sprite);
        this.sprite = null;
    }
    onImageLoaded(error, image) {
        this.sprite.image = image;
    }
}

class Reactive {
    /**
     * Set property of this object to a given value and emit {@link GameEvents#PROPERTY_CHANGED} if its value has been changed.
     * @param key - name of the property to modify.
     * @param value - new property value.
     * @return true if property has been changed; otherwise false.
     */
    set(key, value) {
        if (this[key] === value)
            return false;
        this[key] = value;
        this.actor.emit(GameEvents.PROPERTY_CHANGED, this);
        return true;
    }
    /**
     * Modify property of this object by applying delta value and emit {@link GameEvents#PROPERTY_CHANGED} if its value has been changed.
     * @param key - name of the property to modify.
     * @param delta - delta value to apply to a current value.
     * @return true if property has been changed; otherwise false.
     */
    modify(key, delta) {
        if (!delta)
            return false;
        this[key] += delta;
        this.actor.emit(GameEvents.PROPERTY_CHANGED, this);
        return true;
    }
}

class Highlight {
    /** @inheritDoc */
    awake() {
        this.view = this.actor.add(View);
    }
    setHighlightActive(active) {
        this.view.setImage(active ? this.imageName : null);
    }
}

class Ghost {
    /** @inheritDoc */
    enable() {
        this.time = 0;
        this.body = this.body || this.actor.get(PhysicsBody2D);
        this.sprite = this.sprite || this.actor.get(Sprite);
        this.sprite.filter = "grayscale(100%)";
        this.sprite.opacity = .5;
        Component.disable(this.body);
    }
    /** @inheritDoc */
    disable() {
        this.sprite.opacity = 1;
        this.sprite.filter = null;
        Component.enable(this.body);
    }
    /** @inheritDoc */
    lateUpdate(deltaTime) {
        // accumulate time
        this.time += deltaTime;
        // disable if done
        if (this.time >= this.duration) {
            Component.disable(this);
            return;
        }
        // blinking animation
        if (this.blink) {
            const frequency = 2 + (this.time / this.duration) * 5; // frequency [2 - 7]
            const t = this.time * frequency;
            const sin = Math.sin(t % Math.PI); // [0;1] function with sine ease
            const opacity = sin * .75; // max 75% visibility
            this.sprite.opacity = opacity;
        }
    }
}

class Enemy {
    /** @inheritDoc */
    awake() {
        this.layer = this.actor.require(Layer);
        this.transform = this.actor.require(Transform);
    }
}

/** Spawn enemies. */
class EnemySpawn {
    constructor() {
        this.pool = [];
        this.enemies = [];
        this.delayCountDown = 0;
    }
    /**
     * Speed-up all enemies by given factor.
     * @param f - enemy speed multiplication.
     * @param min - min speed of the enemy.
     */
    speedup(f = 3, min = 300) {
        this.delayCountDown = 0;
        for (const enemy of this.enemies) {
            const velocity = enemy.motor.velocity;
            const sign = velocity.x >= 0 ? 1 : -1;
            const vx = Math.max(Math.abs(velocity.x) * f, min);
            velocity.x = vx * sign;
        }
    }
    /** @inheritDoc */
    start() {
        this.terrain = this.terrain || this.actor.stage.findComponentOfType(Terrain2D);
        this.resources = this.resources || this.actor.stage.findComponentOfType(Resources);
    }
    /** @inheritDoc */
    enable() {
        this.delayCountDown = 0;
    }
    /** @inheritDoc */
    update(deltaTime) {
        const enemyLimit = this.enemyLimit();
        // delay between spawns
        this.delayCountDown -= deltaTime;
        if (this.delayCountDown > 0)
            return;
        // are more enemies required?
        if (this.enemies.length >= enemyLimit)
            return;
        // spawn enemy
        const enemy = this.spawn();
        enemy.actor.setActive(true);
        this.enemies.push(enemy);
        // delay ±25%
        this.delayCountDown = this.delay() * Random.deviation(.25);
    }
    /** @inheritDoc */
    lateUpdate(deltaTime) {
        const { terrain } = this;
        const xMin = terrain.positionX(-1);
        const xMax = terrain.positionX(terrain.size.x);
        // deactivate enemies that has gone through the whole line
        for (let i = 0; i < this.enemies.length; i++) {
            const enemy = this.enemies[i];
            // check enemy is within terran range
            const { position } = enemy.transform;
            if (position.x <= xMax)
                if (position.x >= xMin)
                    continue;
            // deactivate enemy
            enemy.actor.setActive(false);
            this.pool.push(enemy);
            if (Bag.removeAt(this.enemies, i))
                i--;
        }
    }
    /** @inheritDoc */
    disable() {
        for (const enemy of this.enemies)
            enemy.actor.setActive(false);
        this.pool.push.apply(this.pool, this.enemies);
        this.enemies.length = 0;
    }
    spawn() {
        // request enemy instance
        const enemy = this.pool.length > 0 ? this.pool.pop() : this.enemyFactory();
        // select direction
        const leftToRight = Math.random() < 0.5;
        // configure
        const { terrain } = this;
        const tileY = Random.rangeInt(this.yTileRange.min, this.yTileRange.max + 1);
        enemy.transform.position.y = terrain.positionY(tileY);
        // velocity ±25%
        const velocity = this.enemyVelocity() * Random.deviation(.25);
        // setup direction
        if (leftToRight) {
            enemy.motor.velocity.x = velocity;
            enemy.transform.scale.x = 1;
            enemy.transform.position.x = terrain.positionX(-1);
        }
        else {
            enemy.motor.velocity.x = -velocity;
            enemy.transform.scale.x = -1;
            enemy.transform.position.x = terrain.positionX(terrain.size.x);
        }
        return enemy;
    }
}

class Bounty {
    /** @inheritDoc */
    awake() {
        this.view = this.actor.add(View);
        this.layer = this.actor.add(Layer);
        this.highlight = this.actor.add(Highlight);
        this.transform = this.actor.require(Transform);
    }
}

class BountySpawn {
    constructor() {
        this.actors = new Set();
        /** Positions for bonus tile. */
        this.spots = [];
        /** List of bonus images. */
        this.bonuses = [
            "heart.png",
            "gem-blue.png",
            "gem-green.png",
            "gem-orange.png",
        ];
    }
    /** @inheritDoc */
    start() {
        this.terrainPath = this.terrainPath || this.actor.stage.findComponentOfType(TerrainPath);
    }
    /** @inheritDoc */
    disable() {
        for (const actor of this.actors)
            if (!actor.destroyed)
                actor.destroy();
    }
    /** Spawn bounty on the given position. */
    spawn(x, y) {
        const { terrain } = this.bonusPathLayer;
        const bounty = this.bountyFactory();
        const { position } = bounty.transform;
        position.x = terrain.positionX(x);
        position.y = terrain.positionY(y);
        this.actors.add(bounty.actor);
        return bounty;
    }
    /** Randomly generate special bonus. */
    gamble() {
        // success if in (0; chance] range
        if (Math.random() > this.chance())
            return;
        const { bonusPathLayer } = this;
        Random.shuffle(this.spots);
        for (const spot of this.spots) {
            if (!bonusPathLayer.getTile(spot.x, spot.y)) {
                this.bonus(spot.x, spot.y);
                break;
            }
        }
    }
    bonus(x, y) {
        const { bonusPathLayer, bonuses, terrainPath } = this;
        const bounty = this.spawn(x, y);
        const { sprite } = bounty.view;
        sprite.setScale(.5, .5);
        sprite.setOffset(.25, .25);
        const bonus = bonuses[Random.rangeInt(0, bonuses.length)];
        bounty.view.setImage(bonus);
        bounty.actor.on(Actor.DESTROYING, this.onBonusDestroy, this);
        bonusPathLayer.setTile(x, y, terrainPath.image);
    }
    onBonusDestroy(actor) {
        this.actors.delete(actor);
        const { bonusPathLayer } = this;
        const { terrain } = bonusPathLayer;
        const transform = actor.get(Transform);
        const row = terrain.rowByPosX(transform.position.x);
        const col = terrain.colByPosY(transform.position.y);
        bonusPathLayer.setTile(row, col);
    }
}

/** Terrain path generator. */
class TerrainPath {
    constructor() {
        this.now = { x: 0, y: 0 };
        this.ways = [];
        this.from = { x: 0, y: 0 };
    }
    /**
     * Generate random path from point to a given Y line.
     * @param fromX - path starting X position.
     * @param fromY - path starting Y position.
     * @param toY - path destination Y axis.
     * @return finish position, that should be copied for future use.
     */
    generate(fromX, fromY, toY) {
        this.toY = toY;
        this.from.x = this.now.x = fromX;
        this.from.y = this.now.y = fromY;
        this.layer.clear();
        this.direction = toY > fromY ? Vector2.up : Vector2.down;
        // draw image on current tile
        this.moveBy(Vector2.zero);
        // first 2 moves always in given direction
        let direction = this.direction;
        this.moveBy(direction);
        while (direction && this.now.y !== toY - 2 * this.direction.y) {
            this.moveBy(direction);
            direction = this.next();
        }
        // last move to final tile
        this.moveBy(this.direction);
        this.moveBy(this.direction);
        return this.now;
    }
    next() {
        try {
            // select possible ways
            for (const direction of TerrainPath.directions)
                if (this.canMoveBy(direction))
                    this.ways.push(direction);
            // exit if not further way
            if (this.ways.length < 1)
                return;
            const index = Random.rangeInt(0, this.ways.length);
            return this.ways[index];
        }
        finally {
            this.ways.length = 0;
        }
    }
    moveBy(delta) {
        this.now.x += delta.x;
        this.now.y += delta.y;
        this.layer.setTile(this.now.x, this.now.y, this.image);
    }
    canMoveBy(delta) {
        if (!this.canMoveByX(delta.x))
            return false;
        if (!this.canMoveByY(delta.y))
            return false;
        const x = this.now.x + delta.x;
        const y = this.now.y + delta.y;
        // already has tile?
        if (this.layer.getTile(x, y))
            return false;
        // avoid having squares
        if (delta.x)
            if (this.layer.getTile(x, y - this.direction.y))
                return false;
        return true;
    }
    canMoveByY(delta) {
        const y = this.now.y + delta;
        // down?
        if (this.toY > this.from.y)
            return delta >= 0 && y < this.toY;
        // up?
        if (this.toY < this.from.y)
            return delta <= 0 && y > this.toY;
    }
    canMoveByX(delta) {
        const { layer } = this;
        const { size } = layer.terrain;
        const x = this.now.x + delta;
        return x >= 1 && x < size.x - 1;
    }
}
TerrainPath.directions = [
    Vector2.up,
    Vector2.down,
    Vector2.left,
    Vector2.right,
];

class Player {
    constructor() {
        /**
         * Position where player should be located.
         * Use this value for logic calculations instead of transforms portion
         * since transform can be used to smoothly move player over time.
         */
        this.position = { x: 0, y: 0 };
        /** Smooth movement velocity, which can be used to store value of {@link Mathf#smooth}. */
        this.velocity = { x: 0, y: 0 };
    }
    /** @inheritDoc */
    awake() {
        this.view = this.actor.require(View);
        this.stats = this.actor.require(PlayerStats);
        this.transform = this.actor.require(Transform);
    }
    /** @inheritDoc */
    enable() {
        this.position.x = this.transform.position.x;
        this.position.y = this.transform.position.y;
        this.velocity.x = this.velocity.y = 0;
    }
    /** @inheritDoc */
    start() {
        // TODO: select char
        this.view.setImage("char-boy.png");
    }
    /** Apply {@link position} value to a {@link transform}. */
    applyPosition(x, y) {
        this.transform.position.x = this.position.x = x;
        this.transform.position.y = this.position.y = y;
        this.velocity.x = this.velocity.y = 0;
    }
    /**
     * Smoothly move player.
     * @param smoothTime - approx time of achieving destination value.
     * @param deltaTime - ime since last call of this function.
     */
    smooth(smoothTime, deltaTime) {
        Vector2.smooth(this.transform.position, this.position, this.velocity, smoothTime, deltaTime);
    }
    /** Hit player. */
    hit() {
        const { stats } = this;
        if (stats.dead)
            throw new Error("player is already dead!");
        // take out life
        stats.set("lives", stats.lives - 1);
        this.actor.emit(GameEvents.PLAYER_HIT, this); // hit event
        // last life?
        if (stats.lives <= 0)
            this.kill();
    }
    /** Kill player. */
    kill() {
        if (this.stats.dead)
            throw new Error("player is already dead!");
        this.stats.set("dead", true); // death flag
        this.actor.emit(GameEvents.PLAYER_DIE, this); // die event
    }
    /** @inheritDoc */
    triggerEnter2D(collider) {
        const bounty = collider.actor.get(Bounty);
        if (bounty)
            this.actor.emit(GameEvents.PLAYER_BOUNTY_COLLISION, bounty);
        const enemy = collider.actor.get(Enemy);
        if (enemy)
            this.actor.emit(GameEvents.PLAYER_ENEMY_COLLISION, enemy);
    }
    /** @inheritDoc */
    triggerExit2D(collider) {
        console.log("exit", collider.actor.name, collider.actor.id);
    }
}

class PlayerStats extends Reactive {
    /** @inheritDoc */
    awake() {
        this.reset();
    }
    /** Reset stats to initial value. */
    reset() {
        this.set("score", 0);
        this.set("level", 0);
        this.set("lives", 0);
        this.set("dead", false);
        return this;
    }
}

/**
 * Controls the player movement, by reacting on input events.
 */
class PlayerControls {
    constructor() {
        this.keys = new Set();
        this.direction = { x: 0, y: 0 };
        this.moveDelay = 0.02; // 20 ms;
        this.moveCountDown = 0;
        this.smoothTime = 0.15;
        /** Set of walkable tiles. */
        this.walkable = new Set();
    }
    /** @inheritDoc */
    start() {
        this.player = this.player || this.actor.stage.findComponentOfType(Player);
        this.canvas = this.canvas || this.actor.stage.findComponentOfType(Canvas);
        this.terrain = this.terrain || this.actor.stage.findComponentOfType(Terrain2D);
        const OPTIONS = { passive: false };
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
    }
    /** @inheritDoc */
    lateUpdate(deltaTime) {
        this.moveCountDown -= deltaTime;
        if (this.moveCountDown < 0) {
            this.moveCountDown = this.moveDelay;
            this.move();
        }
        this.player.smooth(this.smoothTime, deltaTime);
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
    handleEvent(e) {
        // touch?
        switch (e.type) {
            case "touchstart":
            case "touchmove":
            case "touchend":
            case "touchcancel":
                this.moveCountDown = 0;
                this.touches = e.touches;
                break;
        }
        switch (e.type) {
            case "touchmove":
                e.preventDefault();
                break;
        }
        // mouse?
        switch (e.type) {
            case "mousedown":
                this.moveCountDown = 0;
                this.mouse = e;
                break;
            case "mousemove":
                if (this.mouse)
                    this.mouse = e;
                break;
            case "mouseup":
                this.mouse = null;
                break;
        }
        // key?
        switch (e.type) {
            case "keydown":
                if (this.onKey(e.code, true))
                    this.moveCountDown = 0;
                break;
            case "keyup":
                this.onKey(e.code, false);
                break;
        }
    }
    /**
     * Process key-press event.
     * @param code - key code.
     * @param down - whether key is down or not.
     * @return true if direction changed; false otherwise.
     */
    onKey(code, down) {
        let x = 0, y = 0;
        const delta = down ? 1 : -1;
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
    submitKey(key, down) {
        const { keys } = this;
        return down
            ? !keys.has(key) && keys.add(key)
            : keys.delete(key);
    }
    /**
     * Automatically move player by any active input source.
     * @return true when moved in any direction; false otherwise.
     */
    move() {
        // move by touch?
        const { touches } = this;
        if (touches && touches.length)
            if (this.moveByCursor(touches[0]))
                return true;
        // move by mouse?
        const { mouse } = this;
        if (mouse && this.moveByCursor(mouse))
            return true;
        // move by key?
        const { direction } = this;
        if (this.moveByDirection(direction))
            return true;
        return false;
    }
    /**
     * Move character by client X, Y coordinates provided by a given cursor.
     * @param cursor - cursor providing client X, Y coordinates.
     * @return true when moved in any direction; false otherwise.
     */
    moveByCursor(cursor) {
        const rect = this.canvas.element.getBoundingClientRect();
        return this.moveToPoint(cursor.clientX - rect.x, cursor.clientY - rect.y);
    }
    /**
     * Move character in direction to a given world point.
     * Character can move only by a single axis at one time.
     * @param x - 'X' axis value in world coordinates.
     * @param y - 'Y' axis value in world coordinates.
     * @return true when moved in any direction; false otherwise.
     */
    moveToPoint(x, y) {
        const { terrain } = this;
        const { scale } = this.canvas.transform;
        const { position } = this.player.transform;
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
    moveByDirection(direction) {
        // move only by single axis
        const { x, y } = direction;
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
    moveBy(x, y) {
        if (!x && !y)
            return false;
        // normalize
        x = Mathf.clamp(x, -1, 1);
        y = Mathf.clamp(y, -1, 1);
        const { terrain } = this;
        const { size } = terrain;
        const { position } = this.player.transform;
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
        this.player.position.x = x;
        this.player.position.y = y;
        return true;
    }
}

class GameSettings extends Reactive {
    constructor() {
        super(...arguments);
        /** How much lives player have at start. */
        this.lives = 3;
        /** Chance of spawning special bonus. */
        this.bonusChance = .5;
        /** Delay between consequent enemy spawns. */
        this.enemyDelay = 1;
        /** Maximum number of the enemies at the same time. */
        this.enemyLimit = 2;
        /** Velocity of the enemies by 'X' axis. */
        this.enemyVelocity = 50;
        /** How much time player is invulnerable to damage after being hit. */
        this.invulnerabilityDuration = 2;
        /** Scoring per each type of bounty. */
        this.scores = {
            "checkpoint": 100,
            "gem-blue": 300,
            "gem-green": 400,
            "gem-orange": 500,
        };
    }
}

class GameDifficulty {
    /** Advance game to a next level of difficulty. */
    advance() {
        this.level++;
        this.recalculate();
    }
    /** Reset game difficulty to initial values. */
    reset() {
        this.level = 0;
        this.recalculate();
    }
    /** Recalculate game difficulty values. */
    recalculate() {
        const { settings, level } = this;
        const percents = level / 100;
        this.bonusChance = settings.bonusChance * (1 + 2 * percents); // 2% increase per level
        this.bonusChance = Math.min(this.bonusChance, 1); // max 100%
        this.enemyDelay = settings.enemyDelay * (1 - percents); // 1% faster per level
        this.enemyDelay = Math.max(this.enemyDelay, .25); // not lower than 250ms
        this.enemyLimit = settings.enemyLimit * (1 + 5 * percents); // 5% more per level
        this.enemyLimit = Math.floor(this.enemyLimit); // floor to integer
        this.enemyVelocity = settings.enemyVelocity * (1 + 5 * percents); // 5% faster per level
    }
}

class GameController {
    constructor() {
        this.toTile = { x: 0, y: 0 };
        this.fromTile = { x: 0, y: 0 };
    }
    /** @inheritDoc */
    awake() {
        this.settings = this.actor.require(GameSettings);
        this.difficulty = this.actor.require(GameDifficulty);
        this.difficulty.settings = this.settings;
    }
    /** @inheritDoc */
    start() {
        const { stage } = this.actor;
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
        const { player } = this;
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
        this.gameOver.actor.on("back", this.showMainMenu, this);
        // initial state
        Component.disable(this.controls);
        // show first screen
        window.setTimeout(() => this.showMainMenu(), 100);
    }
    /** Play the game. */
    play() {
        const { terrain, player, settings, overlay, difficulty } = this;
        // discard previous game state
        this.clean();
        overlay.close();
        difficulty.reset();
        player.stats.reset();
        Component.disable(this.cinematicScene);
        Component.disable(this.player.actor.get(Ghost));
        // warm-up components
        Component.restart(this.controls);
        Component.restart(this.enemySpawn);
        Component.restart(this.bountySpawn);
        // initial values
        player.stats.set("lives", settings.lives);
        // initial player position
        player.applyPosition(terrain.positionX(Math.floor(terrain.size.x * .5)), terrain.positionY(0));
        // initial path
        this.continuePath(0);
        // ui
        this.overlay.show(this.statsView);
    }
    /** Cleanup scene. */
    clean() {
        this.terrainPath.layer.clear();
        Component.disable(this.enemySpawn);
        Component.disable(this.bountySpawn);
    }
    /** @inheritDoc */
    draw2D(ctx) {
        this.outlineLayout();
        this.overlayLayout();
    }
    overlayLayout() {
        const { overlay, canvas } = this;
        const { root } = overlay;
        root.style.top = `${canvas.element.offsetTop}px`;
        root.style.left = `${canvas.element.offsetLeft}px`;
        root.style.width = `${canvas.element.width}px`;
        root.style.height = `${canvas.element.height - 2}px`;
    }
    outlineLayout() {
        const { inner, outer, terrain, canvas } = this;
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
    showMainMenu() {
        this.clean();
        this.overlay.close();
        this.overlay.show(this.mainMenu);
        Component.enable(this.cinematicScene);
    }
    showHowToPlay() {
        this.overlay.close();
        this.overlay.show(this.howToPlay);
    }
    /** Player steps on an enemy. */
    hitByEnemy(enemy) {
        this.playHitGfx();
        this.player.hit();
        // ghost mode
        const { player, settings } = this;
        const { dead } = player.stats;
        const ghost = player.actor.require(Ghost);
        ghost.blink = !dead;
        ghost.duration = dead ? Number.POSITIVE_INFINITY : settings.invulnerabilityDuration;
        Component.enable(ghost);
    }
    /** Player steps on a bounty. */
    collectBounty(bounty) {
        const { terrain, player, settings } = this;
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
    die() {
        const { controls, player } = this;
        Component.disable(controls); // disable controls
        Component.disable(player.actor.get(PhysicsBody2D)); // disable collision
        this.overlay.close(); // close HUD
        this.overlay.show(this.gameOver); // show game-over dialog
    }
    /** Play again. */
    replay() {
        this.play();
    }
    /** Player player hit GFX. */
    playHitGfx() {
        for (const outline of this.outlines) {
            outline.classList.remove("hit");
            outline.style.animation = "none";
            outline.offsetHeight; // reflow
            outline.style.animation = null;
            outline.classList.add("hit");
        }
    }
    continuePath(fromY) {
        const { terrain, terrainPath, fromTile } = this;
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
    resolveBountyType(bounty) {
        const image = bounty.view.sprite.image;
        const name = image && image.name || "checkpoint";
        const index = name.lastIndexOf(".");
        return index >= 0 ? name.slice(0, index) : name;
    }
}

class Layers {
}
Layers.TERRAIN = 1;
Layers.BOUNTY = 2;
Layers.PLAYER = 3;
Layers.ENEMY = 4;
class LayerOrder {
}
LayerOrder.TERRAIN_PATH = 1;
LayerOrder.BONUS_PATH_LAYER = 2;
const DEBUG = document.location.pathname.includes("localhost");
class Game {
    constructor() {
        /** Global gizmo rendering configuration. */
        this.gizmos = {
            enable: false,
            sprite: false,
            capsule: false,
            collision: false,
        };
        this.stage = new Stage();
        this.main = document.getElementsByTagName("main")[0];
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
    initCollisionSystem() {
        const collision = new CollisionSystem2D();
        collision.enableLayerCollision(Layers.PLAYER, Layers.ENEMY);
        collision.enableLayerCollision(Layers.PLAYER, Layers.BOUNTY);
        return collision;
    }
    initTerrain() {
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
    initTerrainPath(terrain) {
        const layer = terrain.createLayer();
        layer.setOrder(LayerOrder.TERRAIN_PATH);
        const terrainPath = new TerrainPath();
        terrainPath.image = this.resources.load("stone-block.png");
        terrainPath.layer = layer;
        return terrainPath;
    }
    initPlayer(terrain) {
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
    initEnemySpawn(terrain) {
        const actor = this.stage.createActor("enemy-spawn");
        const spawn = actor.add(EnemySpawn);
        spawn.terrain = terrain;
        spawn.yTileRange = { min: 1, max: terrain.size.y - 2 };
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
    initBountySpawn() {
        const actor = this.stage.createActor("bounty-spawn");
        const bountySpawn = actor.add(BountySpawn);
        bountySpawn.terrainPath = this.terrainPath;
        bountySpawn.bonusPathLayer = this.terrain.createLayer();
        bountySpawn.bonusPathLayer.setOrder(LayerOrder.BONUS_PATH_LAYER);
        const { size } = this.terrain;
        bountySpawn.spots.push({ x: 0, y: 2 });
        bountySpawn.spots.push({ x: 0, y: size.y - 3 });
        bountySpawn.spots.push({ x: size.x - 1, y: 2 });
        bountySpawn.spots.push({ x: size.x - 1, y: size.y - 3 });
        bountySpawn.bountyFactory = () => {
            const { tile } = this.terrain;
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
    initGameController() {
        const actor = this.stage.createActor("game");
        const controller = actor.add(GameController);
        controller.terrain = this.terrain;
        controller.terrainPath = this.terrainPath;
        controller.bountySpawn = this.bountySpawn;
        return controller;
    }
    initUI() {
        this.initStatsView();
        this.initOverlayView();
        this.initGameOverDialog();
        this.initHowToPlayDialog();
        this.initCinematicScene();
        this.initMainMenuDialog();
        if (DEBUG)
            this.initDebugView();
    }
    initStatsView() {
        const actor = this.stage.createActor("stats-view");
        const view = actor.add(StatsView);
        return view;
    }
    initOverlayView() {
        const actor = this.stage.createActor("overlay-view");
        const view = actor.add(OverlayView);
        return view;
    }
    initMainMenuDialog() {
        const actor = this.stage.createActor("main-menu-dialog");
        const view = actor.add(MainMenuDialog);
        return view;
    }
    initGameOverDialog() {
        const actor = this.stage.createActor("game-over-dialog");
        const view = actor.add(GameOverDialog);
        return view;
    }
    initHowToPlayDialog() {
        const actor = this.stage.createActor("how-to-play-dialog");
        const view = actor.add(HowToPlayDialog);
        return view;
    }
    initCinematicScene() {
        const actor = this.stage.createActor("cinematic-scene");
        const view = actor.add(CinematicScene);
        return view;
    }
    initDebugView() {
        const actor = this.stage.createActor("debug-view");
        const view = actor.add(DifficultyView);
    }
    initGizmo(force) {
        if (!this.isGizmoActive() && !force)
            return;
        const { gizmos } = this;
        this.stage.addSystem(new GizmoSystem(this.canvas));
        if (gizmos.sprite)
            Sprite.prototype.gizmo = gizmos.sprite;
        if (gizmos.capsule)
            CapsuleCollider2D.prototype.gizmo = gizmos.capsule;
        if (gizmos.collision)
            CollisionSystem2D.prototype.gizmo = gizmos.collision;
    }
    isGizmoActive() {
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
